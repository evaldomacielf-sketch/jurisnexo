using JurisNexo.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace JurisNexo.Infrastructure.Data.Seed;

public static class PipelineSeedData
{
    public static async Task SeedDefaultPipelineAsync(ApplicationDbContext context, Guid tenantId)
    {
        // Verifica se já existe pipeline
        if (await context.Pipelines.AnyAsync(p => p.TenantId == tenantId))
            return;

        var pipeline = new Pipeline
        {
            TenantId = tenantId,
            Name = "Pipeline Padrão",
            Description = "Pipeline padrão para gestão de leads",
            Color = "#3b82f6",
            IsActive = true,
            IsDefault = true,
            Position = 0
        };

        await context.Pipelines.AddAsync(pipeline);
        await context.SaveChangesAsync();

        // Criar estágios padrão
        var stages = new[]
        {
            new Stage
            {
                TenantId = tenantId,
                PipelineId = pipeline.Id,
                Name = "Prospecção",
                Description = "Primeiro contato com o lead",
                Color = "#94a3b8",
                DefaultProbability = 10,
                Position = 0,
                IsInitialStage = true
            },
            new Stage
            {
                TenantId = tenantId,
                PipelineId = pipeline.Id,
                Name = "Qualificação",
                Description = "Lead qualificado e interessado",
                Color = "#60a5fa",
                DefaultProbability = 30,
                Position = 1
            },
            new Stage
            {
                TenantId = tenantId,
                PipelineId = pipeline.Id,
                Name = "Proposta",
                Description = "Proposta enviada ao cliente",
                Color = "#a78bfa",
                DefaultProbability = 50,
                Position = 2
            },
            new Stage
            {
                TenantId = tenantId,
                PipelineId = pipeline.Id,
                Name = "Negociação",
                Description = "Em negociação de valores/condições",
                Color = "#fb923c",
                DefaultProbability = 70,
                Position = 3
            },
            new Stage
            {
                TenantId = tenantId,
                PipelineId = pipeline.Id,
                Name = "Ganho",
                Description = "Lead convertido em cliente",
                Color = "#22c55e",
                DefaultProbability = 100,
                Position = 4,
                IsWonStage = true
            },
            new Stage
            {
                TenantId = tenantId,
                PipelineId = pipeline.Id,
                Name = "Perdido",
                Description = "Lead não convertido",
                Color = "#ef4444",
                DefaultProbability = 0,
                Position = 5,
                IsLostStage = true
            }
        };

        await context.Stages.AddRangeAsync(stages);
        await context.SaveChangesAsync();
    }
}
