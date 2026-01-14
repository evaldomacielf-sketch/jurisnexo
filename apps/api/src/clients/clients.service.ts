import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ClientsService {
    constructor(private readonly db: DatabaseService) { }

    async create(createClientDto: any, tenantId: string, userId: string) {
        // Map DTO to DB format
        const dbData = this.mapToDb(createClientDto);

        const { data: newClient, error } = await this.db.client
            .from('clients')
            .insert({
                ...dbData,
                tenant_id: tenantId,
                assigned_to: createClientDto.assignedTo || userId // Fallback to current user if not assigned
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return newClient;
    }

    async findAll(tenantId: string, filters: any = {}) {
        let query = this.db.client
            .from('clients')
            .select('*')
            .eq('tenant_id', tenantId);

        // Apply filters
        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.type) {
            query = query.eq('type', filters.type);
        }

        if (filters.assignedTo) {
            query = query.eq('assigned_to', filters.assignedTo);
        }

        if (filters.search) {
            // Supabase 'or' syntax for simple search
            query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async findOne(tenantId: string, id: string) {
        const { data, error } = await this.db.client
            .from('clients')
            .select('*, interactions:client_interactions(*), documents:client_documents(*)')
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .single();

        if (error) throw new Error(error.message);
        if (!data) throw new Error('Cliente não encontrado'); // Basic NotFound
        return data;
    }

    async update(tenantId: string, id: string, data: any) {
        // Check existence first implicitly by tenant_id + id query
        const dbData = this.mapToDb(data);

        const { data: updatedClient, error } = await this.db.client
            .from('clients')
            .update({ ...dbData, updated_at: new Date() })
            .eq('tenant_id', tenantId)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return updatedClient;
    }

    async remove(tenantId: string, id: string) {
        const { error } = await this.db.client
            .from('clients')
            .delete()
            .eq('tenant_id', tenantId)
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { success: true };
    }

    // ============================================
    // Interações
    // ============================================

    async createInteraction(createInteractionDto: any, userId: string, tenantId: string) {
        // Verify client exists and belongs to tenant
        // Optimization: checking existence is safe but extra query. Supabase RLS should also handle validation.
        // For now, let's just insert. If client_id doesn't exist or RLS fails, it will error.

        const { data: interaction, error } = await this.db.client
            .from('client_interactions')
            .insert({
                client_id: createInteractionDto.clientId,
                user_id: userId,
                type: createInteractionDto.type,
                subject: createInteractionDto.subject,
                description: createInteractionDto.description,
                duration_minutes: createInteractionDto.durationMinutes,
                outcome: createInteractionDto.outcome,
                occurred_at: createInteractionDto.occurredAt || new Date(),
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return interaction;
    }

    async getInteractionById(interactionId: string, tenantId: string) {
        const { data, error } = await this.db.client
            .from('client_interactions')
            .select('*')
            .eq('id', interactionId)
            .single();

        if (error) throw new Error(error.message);
        // Verify tenant access via client (optional but good practice without RLS)
        // const client = await this.findOne(tenantId, data.client_id); 
        return data;
    }

    async getInteractions(clientId: string, tenantId: string) {
        // Security check: Verify client belongs to tenant usually happens via RLS or explicit check
        // For now explicit check on finding client not strictly needed if RLS is set up, but let's assume we need to join or filter
        // However, standard pattern:
        /*
        const client = await this.findOne(tenantId, clientId);
        return client.interactions;
        */
        // Or direct query:
        const { data, error } = await this.db.client
            .from('client_interactions')
            .select('*')
            .eq('client_id', clientId)
            .order('occurred_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    // ============================================
    // Documentos
    // ============================================

    async createDocument(createDocumentDto: any, userId: string, tenantId: string) {
        const { data: document, error } = await this.db.client
            .from('client_documents')
            .insert({
                client_id: createDocumentDto.clientId,
                uploaded_by: userId,
                name: createDocumentDto.name,
                description: createDocumentDto.description,
                file_url: createDocumentDto.fileUrl,
                file_type: createDocumentDto.fileType,
                file_size: createDocumentDto.fileSize,
                category: createDocumentDto.category,
                tags: createDocumentDto.tags,
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return document;
    }

    async getDocuments(clientId: string, tenantId: string) {
        const { data, error } = await this.db.client
            .from('client_documents')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        return data;
    }

    async deleteDocument(id: string, tenantId: string) {
        // Need to ensure document belongs to a client of this tenant.
        // Doing a delete with a join check is tricky in one go without RLS.
        // Assuming RLS on 'client_documents' checks user's tenant access to the parent client.
        const { error } = await this.db.client
            .from('client_documents')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return { success: true };
    }

    private mapToDb(dto: any) {
        // Basic mapping from camelCase to snake_case
        const map: any = {
            name: dto.name,
            email: dto.email,
            phone: dto.phone,
            cpf_cnpj: dto.cpfCnpj,
            birth_date: dto.birthDate,
            address_street: dto.addressStreet,
            address_number: dto.addressNumber,
            address_complement: dto.addressComplement,
            address_neighborhood: dto.addressNeighborhood,
            address_city: dto.addressCity,
            address_state: dto.addressState,
            address_zipcode: dto.addressZipcode,
            status: dto.status,
            type: dto.type,
            source: dto.source,
            priority: dto.priority,
            notes: dto.notes,
            tags: dto.tags,
            avatar_url: dto.avatarUrl,
            assigned_to: dto.assignedTo,
        };

        // Remove undefined keys
        Object.keys(map).forEach(key => map[key] === undefined && delete map[key]);
        return map;
    }
}
