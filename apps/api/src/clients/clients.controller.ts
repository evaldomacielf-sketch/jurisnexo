import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, CreateInteractionDto, CreateDocumentDto } from './dto/create-client.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ClientsController {
    constructor(private readonly clientsService: ClientsService) { }

    @Post()
    create(@Body() createClientDto: CreateClientDto, @Request() req: any) {
        return this.clientsService.create(createClientDto, req.user.tenantId, req.user.userId);
    }

    @Get()
    findAll(@Request() req: any, @Query() filters: any) {
        return this.clientsService.findAll(req.user.tenantId, filters);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req: any) {
        return this.clientsService.findOne(req.user.tenantId, id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClientDto: UpdateClientDto, @Request() req: any) {
        return this.clientsService.update(req.user.tenantId, id, updateClientDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req: any) {
        return this.clientsService.remove(req.user.tenantId, id);
    }

    // ============================================
    // Interações
    // ============================================

    @Post('interactions')
    createInteraction(@Body() createInteractionDto: CreateInteractionDto, @Request() req: any) {
        return this.clientsService.createInteraction(createInteractionDto, req.user.userId, req.user.tenantId);
    }

    @Get(':id/interactions')
    getInteractions(@Param('id') clientId: string, @Request() req: any) {
        return this.clientsService.getInteractions(clientId, req.user.tenantId);
    }

    @Get('interactions/:id') // Added specific interaction route
    getInteractionById(@Param('id') interactionId: string, @Request() req: any) {
        return this.clientsService.getInteractionById(interactionId, req.user.tenantId);
    }

    // ============================================
    // Documentos
    // ============================================

    @Post('documents')
    createDocument(@Body() createDocumentDto: CreateDocumentDto, @Request() req: any) {
        return this.clientsService.createDocument(createDocumentDto, req.user.userId, req.user.tenantId);
    }

    @Get(':id/documents')
    getDocuments(@Param('id') clientId: string, @Request() req: any) {
        return this.clientsService.getDocuments(clientId, req.user.tenantId);
    }

    @Delete('documents/:id')
    deleteDocument(@Param('id') id: string, @Request() req: any) {
        return this.clientsService.deleteDocument(id, req.user.tenantId);
    }
}
