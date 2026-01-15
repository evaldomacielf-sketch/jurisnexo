using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.Services
{
    /// <summary>
    /// Stub implementation of Push Notification Service.
    /// Replace with Firebase Cloud Messaging, OneSignal, or similar in production.
    /// </summary>
    public class PushNotificationService : IPushNotificationService
    {
        private readonly ILogger<PushNotificationService> _logger;

        public PushNotificationService(ILogger<PushNotificationService> logger)
        {
            _logger = logger;
        }

        public Task SendAsync(Guid userId, PushNotification notification)
        {
            // TODO: Implement with FCM/OneSignal
            _logger.LogInformation(
                "Push notification to {UserId}: {Title} - {Body}",
                userId,
                notification.Title,
                notification.Body
            );
            return Task.CompletedTask;
        }
    }
}
