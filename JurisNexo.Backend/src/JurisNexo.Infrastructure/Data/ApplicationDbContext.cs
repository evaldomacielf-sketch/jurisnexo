using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using JurisNexo.Domain.Common;
using JurisNexo.Domain.Entities;

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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configurações de entidades
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        // Global query filter para soft delete
        modelBuilder.Entity<BaseEntity>().HasQueryFilter(e => !e.IsDeleted);

        // Global query filter para multi-tenancy
        var tenantId = GetCurrentTenantId();
        if (tenantId.HasValue)
        {
            modelBuilder.Entity<TenantEntity>().HasQueryFilter(e => e.TenantId == tenantId.Value);
        }
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
