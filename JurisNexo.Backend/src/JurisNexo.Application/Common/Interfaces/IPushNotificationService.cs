using System.Threading.Tasks;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IPushNotificationService
    {
        Task SendAsync(System.Guid userId, PushNotification notification);
    }

    public class PushNotification
    {
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public object? Data { get; set; }
    }
}
