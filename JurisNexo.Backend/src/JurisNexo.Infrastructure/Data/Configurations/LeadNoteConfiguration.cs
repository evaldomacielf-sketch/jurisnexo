using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JurisNexo.Domain.Entities;

namespace JurisNexo.Infrastructure.Data.Configurations;

public class LeadNoteConfiguration : IEntityTypeConfiguration<LeadNote>
{
    public void Configure(EntityTypeBuilder<LeadNote> builder)
    {
        builder.ToTable("LeadNotes");

        builder.HasKey(n => n.Id);

        builder.Property(n => n.Content)
            .IsRequired();

        builder.Property(n => n.IsPinned)
            .HasDefaultValue(false);

        builder.HasOne(n => n.CreatedByUser)
            .WithMany()
            .HasForeignKey(n => n.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
