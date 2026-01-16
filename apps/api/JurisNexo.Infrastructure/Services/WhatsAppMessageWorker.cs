using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppMessageWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WhatsAppMessageWorker> _logger;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

        public WhatsAppMessageWorker(
            IServiceProvider serviceProvider,
            ILogger<WhatsAppMessageWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("WhatsAppMessageWorker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var schedulingService = scope.ServiceProvider.GetRequiredService<IWhatsAppSchedulingService>();
                        await schedulingService.ProcessDueMessagesAsync(stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred while processing scheduled messages");
                }

                await Task.Delay(_checkInterval, stoppingToken);
            }

            _logger.LogInformation("WhatsAppMessageWorker stopping.");
        }
    }
}
