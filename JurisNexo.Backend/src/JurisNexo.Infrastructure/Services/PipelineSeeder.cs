using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Data.Seed;

namespace JurisNexo.Infrastructure.Services;

public class PipelineSeeder : IPipelineSeeder
{
    private readonly ApplicationDbContext _context;

    public PipelineSeeder(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task SeedDefaultPipelineAsync(Guid tenantId)
    {
        await PipelineSeedData.SeedDefaultPipelineAsync(_context, tenantId);
    }
}
