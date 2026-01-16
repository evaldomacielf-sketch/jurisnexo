using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JurisNexo.Core.Entities;

namespace JurisNexo.Infrastructure.Data.Configurations;

public class StageConfiguration : IEntityTypeConfiguration<Stage>
{
    public void Configure(EntityTypeBuilder<Stage> builder)
    {
        builder.ToTable("Stages");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(s => s.Description)
            .HasMaxLength(500);

        builder.Property(s => s.Color)
            .HasMaxLength(20);

        builder.Property(s => s.DefaultProbability)
            .HasDefaultValue(50);
            
        builder.Property(s => s.IsInitialStage)
            .HasDefaultValue(false);
            
        builder.Property(s => s.IsWonStage)
            .HasDefaultValue(false);
            
        builder.Property(s => s.IsLostStage)
            .HasDefaultValue(false);    

        builder.HasIndex(s => new { s.PipelineId, s.Position });

        builder.HasMany(s => s.Leads)
            .WithOne(l => l.Stage)
            .HasForeignKey(l => l.StageId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
