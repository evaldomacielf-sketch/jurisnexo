namespace JurisNexo.Application.Common.Interfaces;

public interface IPipelineSeeder
{
    Task SeedDefaultPipelineAsync(Guid tenantId);
}
