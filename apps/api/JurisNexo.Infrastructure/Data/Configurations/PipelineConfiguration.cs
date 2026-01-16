using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JurisNexo.Core.Entities;

namespace JurisNexo.Infrastructure.Data.Configurations;

public class PipelineConfiguration : IEntityTypeConfiguration<Pipeline>
{
    public void Configure(EntityTypeBuilder<Pipeline> builder)
    {
        builder.ToTable("Pipelines");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.Description)
            .HasMaxLength(500);

        builder.Property(p => p.Color)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(p => p.IsActive)
            .IsRequired();
            
        builder.Property(p => p.Position)
            .IsRequired();

        builder.HasIndex(p => new { p.TenantId, p.IsDefault });

        builder.HasMany(p => p.Stages)
            .WithOne(s => s.Pipeline)
            .HasForeignKey(s => s.PipelineId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
