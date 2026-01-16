using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppCleanupWorker : BackgroundService
    {
        private readonly ILogger<WhatsAppCleanupWorker> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromDays(7); // Run weekly

        public WhatsAppCleanupWorker(ILogger<WhatsAppCleanupWorker> logger)
        {
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("WhatsAppCleanupWorker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Logic to cleanup old logs or temp files
                    _logger.LogInformation("Running WhatsApp Cleanup...");
                    await Task.Delay(1000, stoppingToken); 
                    _logger.LogInformation("WhatsApp Cleanup Completed.");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error during WhatsApp cleanup");
                }

                await Task.Delay(_interval, stoppingToken);
            }
        }
    }
}
