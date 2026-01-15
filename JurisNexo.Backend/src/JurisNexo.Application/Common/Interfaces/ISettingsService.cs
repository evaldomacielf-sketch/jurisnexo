using System.Collections.Generic;
using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ISettingsService
    {
        Task<EscritorioSettings> GetEscritorioSettingsAsync();
    }

    public class EscritorioSettings
    {
        public List<string> TargetStates { get; set; } = new();
        public List<string> TargetCities { get; set; } = new();
        // Add other settings as needed
    }
}
