import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryResponseDto } from '../dto/category.dto';

@Injectable()
export class CategoryService {
    constructor(private readonly db: DatabaseService) { }

    /**
     * Cria uma nova categoria
     */
    async create(
        tenantId: string,
        dto: CreateCategoryDto,
        userId: string
    ): Promise<CategoryResponseDto> {
        // Valida se já existe categoria com mesmo nome
        const { data: existing } = await this.db.client
            .from('finance_categories')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('name', dto.name)
            .single();

        if (existing) {
            throw new BadRequestException('Já existe uma categoria com este nome');
        }

        const { data, error } = await this.db.client
            .from('finance_categories')
            .insert({
                tenant_id: tenantId,
                name: dto.name,
                type: dto.type,
                description: dto.description,
                color: dto.color || '#3B82F6',
                icon: dto.icon,
                created_by: userId,
            })
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'CATEGORY',
            entity_id: data.id,
            action: 'CREATE',
            actor_id: userId,
            new_value: data,
        });

        return data;
    }

    /**
     * Lista todas as categorias
     */
    async findAll(tenantId: string, type?: string): Promise<CategoryResponseDto[]> {
        let query = this.db.client
            .from('finance_categories')
            .select('*')
            .eq('tenant_id', tenantId)
            .order('name');

        if (type) {
            query = query.or(`type.eq.${type},type.eq.BOTH`);
        }

        const { data, error } = await query;

        if (error) throw new BadRequestException(error.message);

        return data || [];
    }

    /**
     * Busca uma categoria específica
     */
    async findOne(tenantId: string, id: string): Promise<CategoryResponseDto> {
        const { data, error } = await this.db.client
            .from('finance_categories')
            .select('*')
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .single();

        if (error || !data) {
            throw new NotFoundException('Categoria não encontrada');
        }

        return data;
    }

    /**
     * Atualiza uma categoria
     */
    async update(
        tenantId: string,
        id: string,
        dto: UpdateCategoryDto,
        userId: string
    ): Promise<CategoryResponseDto> {
        const existing = await this.findOne(tenantId, id);

        const { data, error } = await this.db.client
            .from('finance_categories')
            .update({
                ...dto,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .eq('tenant_id', tenantId)
            .select()
            .single();

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'CATEGORY',
            entity_id: id,
            action: 'UPDATE',
            actor_id: userId,
            old_value: existing,
            new_value: data,
        });

        return data;
    }

    /**
     * Remove uma categoria
     */
    async remove(tenantId: string, id: string, userId: string): Promise<void> {
        const existing = await this.findOne(tenantId, id);

        // Verifica se há transações vinculadas
        const { count } = await this.db.client
            .from('finance_transactions')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', id);

        if (count && count > 0) {
            throw new BadRequestException(
                'Não é possível excluir uma categoria com transações vinculadas'
            );
        }

        const { error } = await this.db.client
            .from('finance_categories')
            .delete()
            .eq('id', id)
            .eq('tenant_id', tenantId);

        if (error) throw new BadRequestException(error.message);

        // Audit log
        await this.db.client.from('finance_audit_log').insert({
            tenant_id: tenantId,
            entity_type: 'CATEGORY',
            entity_id: id,
            action: 'DELETE',
            actor_id: userId,
            old_value: existing,
        });
    }

    /**
     * Seed de categorias padrão para um novo tenant
     */
    async seedDefaultCategories(tenantId: string, userId: string): Promise<void> {
        const defaultCategories = [
            // Income
            { name: 'Honorários Advocatícios', type: 'INCOME', color: '#10B981', icon: 'IconScale', description: 'Valores recebidos por serviços advocatícios' },
            { name: 'Consultoria Jurídica', type: 'INCOME', color: '#3B82F6', icon: 'IconBriefcase', description: 'Receitas de consultoria e assessoria jurídica' },
            { name: 'Custas Processuais Reembolsadas', type: 'INCOME', color: '#8B5CF6', icon: 'IconReceipt', description: 'Reembolso de custas pagas pelo cliente' },

            // Expense
            { name: 'Custas Processuais', type: 'EXPENSE', color: '#EF4444', icon: 'IconReceipt', description: 'Custas judiciais e cartorárias' },
            { name: 'Salários e Encargos', type: 'EXPENSE', color: '#F59E0B', icon: 'IconUsers', description: 'Folha de pagamento e encargos trabalhistas' },
            { name: 'Aluguel', type: 'EXPENSE', color: '#8B5CF6', icon: 'IconHome', description: 'Aluguel do escritório' },
            { name: 'Água, Luz e Telefone', type: 'EXPENSE', color: '#06B6D4', icon: 'IconBolt', description: 'Contas de utilidades' },
            { name: 'Material de Escritório', type: 'EXPENSE', color: '#EC4899', icon: 'IconPencil', description: 'Materiais de consumo' },
            { name: 'Tecnologia e Software', type: 'EXPENSE', color: '#6366F1', icon: 'IconDeviceLaptop', description: 'Sistemas, softwares e equipamentos de TI' },
            { name: 'Marketing e Publicidade', type: 'EXPENSE', color: '#14B8A6', icon: 'IconSpeakerphone', description: 'Despesas com marketing digital e publicidade' },
            { name: 'Impostos e Tributos', type: 'EXPENSE', color: '#DC2626', icon: 'IconBuildingBank', description: 'Impostos federais, estaduais e municipais' },
            { name: 'Honorários Terceiros', type: 'EXPENSE', color: '#F97316', icon: 'IconUsers', description: 'Pagamento a correspondentes e peritos' },
            { name: 'Deslocamento', type: 'EXPENSE', color: '#EAB308', icon: 'IconCar', description: 'Despesas com transporte e viagens' },
            { name: 'Capacitação', type: 'EXPENSE', color: '#A855F7', icon: 'IconBook', description: 'Cursos, treinamentos e eventos' }
        ];

        const { error } = await this.db.client.from('finance_categories').insert(
            defaultCategories.map(cat => ({
                ...cat,
                tenant_id: tenantId,
                created_by: userId,
            }))
        );

        if (error) {
            console.error('Error seeding default categories:', error.message);
        }
    }

    /**
     * Obtém estatísticas por categoria
     */
    async getCategoryStats(tenantId: string, startDate?: string, endDate?: string): Promise<any[]> {
        let query = this.db.client
            .from('finance_transactions')
            .select('category_id, type, amount, category:finance_categories(id, name, color, type)')
            .eq('tenant_id', tenantId)
            .eq('status', 'COMPLETED');

        if (startDate) {
            query = query.gte('transaction_date', startDate);
        }
        if (endDate) {
            query = query.lte('transaction_date', endDate);
        }

        const { data, error } = await query;

        if (error) throw new BadRequestException(error.message);

        // Agrupa por categoria
        const grouped = data?.reduce((acc: Record<string, any>, transaction: any) => {
            const categoryId = transaction.category_id;
            if (!acc[categoryId]) {
                acc[categoryId] = {
                    id: categoryId,
                    name: transaction.category?.name,
                    color: transaction.category?.color,
                    type: transaction.category?.type,
                    total: 0,
                    count: 0,
                };
            }

            acc[categoryId].total += transaction.amount;
            acc[categoryId].count += 1;

            return acc;
        }, {});

        return Object.values(grouped || {}).sort((a: any, b: any) => b.total - a.total);
    }
}
