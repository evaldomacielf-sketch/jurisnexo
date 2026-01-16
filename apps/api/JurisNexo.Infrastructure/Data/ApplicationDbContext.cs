using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using JurisNexo.Core.Common;
using JurisNexo.Core.Entities;

namespace JurisNexo.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options,
        IHttpContextAccessor httpContextAccessor) : base(options)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Contact> Contacts => Set<Contact>();
    public DbSet<Interaction> Interactions => Set<Interaction>();
    public DbSet<ContactDocument> ContactDocuments => Set<ContactDocument>();
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<CaseEvent> CaseEvents => Set<CaseEvent>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<AppointmentParticipant> AppointmentParticipants => Set<AppointmentParticipant>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<MessageTemplate> MessageTemplates => Set<MessageTemplate>();
    public DbSet<Pipeline> Pipelines => Set<Pipeline>();
    public DbSet<Stage> Stages => Set<Stage>();
    public DbSet<Lead> Leads => Set<Lead>();
    public DbSet<LeadActivity> LeadActivities => Set<LeadActivity>();
    public DbSet<LeadNote> LeadNotes => Set<LeadNote>();
    public DbSet<WhatsAppConversation> WhatsAppConversations => Set<WhatsAppConversation>();
    public DbSet<WhatsAppMessage> WhatsAppMessages => Set<WhatsAppMessage>();
    public DbSet<WhatsAppTemplate> WhatsAppTemplates => Set<WhatsAppTemplate>();
    public DbSet<WhatsAppWebhookLog> WhatsAppWebhookLogs => Set<WhatsAppWebhookLog>();
    public DbSet<WhatsAppContact> WhatsAppContacts => Set<WhatsAppContact>();
    public DbSet<WhatsAppMedia> WhatsAppMedia => Set<WhatsAppMedia>();
    public DbSet<ConversationTransfer> ConversationTransfers => Set<ConversationTransfer>();
    public DbSet<ScheduledMessage> ScheduledMessages => Set<ScheduledMessage>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();
    
    // Financial Entities
    public DbSet<JurisNexo.Core.Entities.Financial.Transaction> Transactions => Set<JurisNexo.Core.Entities.Financial.Transaction>();
    public DbSet<JurisNexo.Core.Entities.Financial.Invoice> Invoices => Set<JurisNexo.Core.Entities.Financial.Invoice>();
    public DbSet<JurisNexo.Core.Entities.Financial.PaymentMethod> PaymentMethods => Set<JurisNexo.Core.Entities.Financial.PaymentMethod>();
    
    // Lead Triaging System
    public DbSet<LeadQualificationQuestion> LeadQualificationQuestions => Set<LeadQualificationQuestion>();
    public DbSet<LeadQualificationAnswer> LeadQualificationAnswers => Set<LeadQualificationAnswer>();
    public DbSet<LeadScore> LeadScores => Set<LeadScore>();
    public DbSet<LeadRoutingRule> LeadRoutingRules => Set<LeadRoutingRule>();
    public DbSet<LeadAssignment> LeadAssignments => Set<LeadAssignment>();
    public DbSet<LeadConversionFunnel> LeadConversionFunnels => Set<LeadConversionFunnel>();
    public DbSet<LeadFollowUpTask> LeadFollowUpTasks => Set<LeadFollowUpTask>();
    public DbSet<Honorario> Honorarios => Set<Honorario>();
    public DbSet<CRMAutoSyncSettings> CRMAutoSyncSettings => Set<CRMAutoSyncSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configurações de entidades
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Apply global filters to all entities inheriting from BaseEntity or TenantEntity
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            // Soft Delete Filter
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
                var body = System.Linq.Expressions.Expression.Not(
                    System.Linq.Expressions.Expression.Property(parameter, nameof(BaseEntity.IsDeleted)));
                var lambda = System.Linq.Expressions.Expression.Lambda(body, parameter);

                modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
            }

            // Multi-tenancy Filter
            if (typeof(TenantEntity).IsAssignableFrom(entityType.ClrType))
            {
                var currentTenantId = GetCurrentTenantId();
                if (currentTenantId.HasValue)
                {
                    var parameter = System.Linq.Expressions.Expression.Parameter(entityType.ClrType, "e");
                    var property = System.Linq.Expressions.Expression.Property(parameter, nameof(TenantEntity.TenantId));
                    var constant = System.Linq.Expressions.Expression.Constant(currentTenantId.Value);
                    var body = System.Linq.Expressions.Expression.Equal(property, constant);
                    var lambda = System.Linq.Expressions.Expression.Lambda(body, parameter);

                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(lambda);
                }
            }
        }

        // Apply Encryption to WhatsAppMessage Content
        modelBuilder.Entity<WhatsAppMessage>()
            .Property(e => e.Content)
            .HasConversion(new JurisNexo.Infrastructure.Data.Converters.EncryptionValueConverter());
    }
    
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Atualiza UpdatedAt automaticamente
        var entries = ChangeTracker.Entries<BaseEntity>()
            .Where(e => e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            entry.Entity.UpdatedAt = DateTime.UtcNow;
        }

        // Adiciona TenantId automaticamente
        var tenantEntries = ChangeTracker.Entries<TenantEntity>()
            .Where(e => e.State == EntityState.Added);

        var tenantId = GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            foreach (var entry in tenantEntries)
            {
                entry.Entity.TenantId = tenantId.Value;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }

    private Guid? GetCurrentTenantId()
    {
        var tenantIdClaim = _httpContextAccessor.HttpContext?.User
            ?.FindFirst("tenant_id")?.Value;

        return tenantIdClaim != null ? Guid.Parse(tenantIdClaim) : null;
    }
}
