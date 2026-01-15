import { Body, Controller, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { PaymentPortalService } from './payment-portal.service';
import { CreatePaymentCheckoutDto, UpdatePaymentPortalSettingsDto } from './dto/payment-portal.dto';

@ApiTags('Payment Portal')
@Controller('finance/payment-portal')
export class PaymentPortalController {
    constructor(private readonly paymentPortalService: PaymentPortalService) { }

    // Protected Admin Routes
    @Put('settings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update portal branding and settings' })
    updateSettings(@Request() req, @Body() dto: UpdatePaymentPortalSettingsDto) {
        return this.paymentPortalService.updateSettings(req.user.tenantId, req.user.id, dto);
    }

    @Get('settings')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get portal settings' })
    getSettings(@Request() req) {
        return this.paymentPortalService.getSettings(req.user.tenantId);
    }

    @Post('checkouts')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a payment link' })
    createCheckout(@Request() req, @Body() dto: CreatePaymentCheckoutDto) {
        return this.paymentPortalService.createCheckout(req.user.tenantId, req.user.id, dto);
    }

    // Public Route (No Guard)
    @Get('public/:slug')
    @ApiOperation({ summary: 'Get public checkout details' })
    getPublicCheckout(@Param('slug') slug: string) {
        return this.paymentPortalService.getPublicCheckout(slug);
    }
}
