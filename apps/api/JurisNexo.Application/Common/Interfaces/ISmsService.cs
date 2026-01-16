using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface ISmsService
    {
        Task SendAsync(string phoneNumber, string message);
    }
}
