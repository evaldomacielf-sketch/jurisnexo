using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.Services
{
    /// <summary>
    /// Stub implementation of SMS Service.
    /// Replace with Twilio, AWS SNS, or similar in production.
    /// </summary>
    public class SmsService : ISmsService
    {
        private readonly ILogger<SmsService> _logger;

        public SmsService(ILogger<SmsService> logger)
        {
            _logger = logger;
        }

        public Task SendAsync(string phoneNumber, string message)
        {
            // TODO: Implement with Twilio/AWS SNS
            _logger.LogInformation(
                "SMS to {PhoneNumber}: {Message}",
                phoneNumber,
                message
            );
            return Task.CompletedTask;
        }
    }
}
