using System.Collections.Generic;
using System.Threading.Tasks;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.Services
{
    public class SettingsService : ISettingsService
    {
        public Task<EscritorioSettings> GetEscritorioSettingsAsync()
        {
            // Stub: Retrieve from Database or Config in real app
            return Task.FromResult(new EscritorioSettings
            {
                TargetStates = new List<string> { "SP", "RJ", "MG" },
                TargetCities = new List<string> { "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Campinas" }
            });
        }
    }
}
