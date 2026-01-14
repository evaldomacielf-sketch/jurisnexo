using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System.Text.Json;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Infrastructure.Data.Configurations;

public class LeadConfiguration : IEntityTypeConfiguration<Lead>
{
    public void Configure(EntityTypeBuilder<Lead> builder)
    {
        builder.ToTable("Leads");

        builder.HasKey(l => l.Id);

        builder.Property(l => l.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(l => l.Description)
            .HasMaxLength(2000);

        builder.Property(l => l.Currency)
            .IsRequired()
            .HasMaxLength(3);

        builder.Property(l => l.Source)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(l => l.Priority)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.Property(l => l.Status)
            .HasConversion<string>()
            .HasMaxLength(50);

        // Configure Tags as JSONB
        builder.Property(l => l.Tags)
            .HasConversion(
                v => JsonSerializer.Serialize(v, (JsonSerializerOptions)null!),
                v => JsonSerializer.Deserialize<List<string>>(v, (JsonSerializerOptions)null!) ?? new List<string>()
            )
            .HasColumnType("jsonb");

        // Relationships
        builder.HasOne(l => l.Contact)
            .WithMany(c => c.Leads)
            .HasForeignKey(l => l.ContactId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.Pipeline)
            .WithMany() // Pipeline has Stages, not direct Leads usually, but logic might vary. Lead -> Pipeline is set.
            .HasForeignKey(l => l.PipelineId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.Stage)
            .WithMany(s => s.Leads)
            .HasForeignKey(l => l.StageId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(l => l.AssignedToUser)
            .WithMany(u => u.AssignedLeads)
            .HasForeignKey(l => l.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(l => l.Activities)
            .WithOne(a => a.Lead)
            .HasForeignKey(a => a.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(l => l.Notes)
            .WithOne(n => n.Lead)
            .HasForeignKey(n => n.LeadId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(l => new { l.TenantId, l.PipelineId, l.StageId, l.Position });
    }
}
