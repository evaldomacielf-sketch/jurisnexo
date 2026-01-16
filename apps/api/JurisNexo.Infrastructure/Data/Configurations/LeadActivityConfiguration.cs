using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using JurisNexo.Core.Entities;
using Newtonsoft.Json;

namespace JurisNexo.Infrastructure.Data.Configurations;

public class LeadActivityConfiguration : IEntityTypeConfiguration<LeadActivity>
{
    public void Configure(EntityTypeBuilder<LeadActivity> builder)
    {
        builder.ToTable("LeadActivities");

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Description)
            .IsRequired()
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(a => a.Title)
            .HasMaxLength(200);

        builder.Property(l => l.Metadata)
            .HasColumnType("jsonb") // PostgreSQL JSONB column
            .HasConversion(
                v => JsonConvert.SerializeObject(v, new JsonSerializerSettings { NullValueHandling = NullValueHandling.Ignore }),
                v => JsonConvert.DeserializeObject<Dictionary<string, object>>(v) ?? new Dictionary<string, object>()
            );

        builder.Property(a => a.Type)
            .HasConversion<string>()
            .HasMaxLength(50);

        builder.HasOne(a => a.AssignedToUser)
            .WithMany()
            .HasForeignKey(a => a.AssignedToUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
