import { Controller, Get, Post, Put, Body, Param, UseGuards, Req } from '@nestjs/common';
import { CreatePaymentCheckoutDto, UpdatePaymentPortalSettingsDto, ProcessPaymentDto } from '../dto/payment-portal.dto';
import { PaymentPortalService } from '../services/payment-portal.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../auth/decorators/current-tenant.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CurrentTenant } from '../../auth/decorators/current-tenant.decorator';
import { User as UserEntity } from '@supabase/supabase-js';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';

@ApiTags('Finance - Payment Portal')
@Controller('finance/payment-portal')
export class PaymentPortalController {
    constructor(private readonly service: PaymentPortalService) { }

    @Get('settings')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Gets portal settings' })
    async getSettings(@CurrentTenant() tenantId: string) {
        return this.service.getSettings(tenantId);
    }

    @Put('settings')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Updates portal settings' })
    async updateSettings(
        @CurrentTenant() tenantId: string,
        @Body() dto: UpdatePaymentPortalSettingsDto
    ) {
        return this.service.updateSettings(tenantId, dto);
    }

    @Post('checkouts')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Creates a new checkout/payment link' })
    async createCheckout(
        @CurrentUser() user: UserEntity,
        @CurrentTenant() tenantId: string,
        @Body() dto: CreatePaymentCheckoutDto
    ) {
        return this.service.createCheckout(tenantId, user.id, dto);
    }

    @Get('checkouts/:slug')
    @Public()
    @ApiOperation({ summary: 'Gets checkout by slug (Public)' })
    async getCheckout(@Param('slug') slug: string) {
        return this.service.getCheckoutBySlug(slug);
    }

    @Post('checkouts/:slug/pay')
    @Public()
    @ApiOperation({ summary: 'Processes a payment' })
    async processPayment(@Param('slug') slug: string, @Body() dto: ProcessPaymentDto) {
        return this.service.processPayment(slug, dto);
    }

    @Post('webhooks/stripe')
    @Public()
    @ApiOperation({ summary: 'Stripe Webhook' })
    async stripeWebhook(@Req() req: any) {
        // Need raw body for stripe signature verification usually
        const signature = req.headers['stripe-signature'];
        const rawBody = req.rawBody; // Make sure raw body is available
        return this.service.processStripeWebhook(rawBody, signature);
    }

    @Post('webhooks/asaas')
    @Public()
    @ApiOperation({ summary: 'Asaas Webhook' })
    async asaasWebhook(@Body() body: any) {
        return this.service.processAsaasWebhook(body);
    }
}
