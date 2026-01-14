import { Injectable, Inject, Logger } from '@nestjs/common';
import { CreateCaseDto } from './dto/create-case.dto';
import { SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class CasesService {
    private readonly logger = new Logger(CasesService.name);

    constructor(
        @Inject('SUPABASE_CLIENT')
        private readonly supabase: SupabaseClient,
    ) { }

    async create(createCaseDto: CreateCaseDto, tenantId: string) {
        const { data: newCase, error } = await this.supabase
            .from('cases')
            .insert({
                ...createCaseDto,
                tenant_id: tenantId,
                status: createCaseDto.status || 'active',
                priority: createCaseDto.priority || 'medium',
                is_urgent: createCaseDto.is_urgent || false,
            })
            .select()
            .single();

        if (error) {
            this.logger.error(`Error creating case: ${error.message}`);
            throw error;
        }

        return newCase;
    }

    async findAll(tenantId: string, params?: { status?: string; search?: string }) {
        let query = this.supabase
            .from('cases')
            .select(`
        *,
        client:clients(id, name, phone, email),
        responsible_lawyer:users(id, name, email)
      `)
            .eq('tenant_id', tenantId)
            .order('created_at', { ascending: false });

        if (params?.status && params.status !== 'all') {
            query = query.eq('status', params.status);
        }

        if (params?.search) {
            query = query.ilike('title', `%${params.search}%`);
        }

        const { data, error } = await query;

        if (error) {
            this.logger.error(`Error fetching cases: ${error.message}`);
            throw error;
        }

        return data;
    }

    async findOne(id: string, tenantId: string) {
        const { data, error } = await this.supabase
            .from('cases')
            .select(`
        *,
        client:clients(id, name, phone, email),
        responsible_lawyer:users(id, name, email)
      `)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error) {
            this.logger.error(`Error fetching case ${id}: ${error.message}`);
            throw error;
        }

        return data;
    }

    async update(id: string, updateCaseDto: Partial<CreateCaseDto>, tenantId: string) {
        const { data, error } = await this.supabase
            .from('cases')
            .update(updateCaseDto)
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) {
            this.logger.error(`Error updating case ${id}: ${error.message}`);
            throw error;
        }

        return data;
    }

    async remove(id: string, tenantId: string) {
        const { error } = await this.supabase
            .from('cases')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) {
            this.logger.error(`Error deleting case ${id}: ${error.message}`);
            throw error;
        }

        return { success: true };
    }
}
