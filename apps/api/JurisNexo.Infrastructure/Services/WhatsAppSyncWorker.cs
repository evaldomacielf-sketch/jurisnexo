using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppSyncWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<WhatsAppSyncWorker> _logger;
        private readonly TimeSpan _interval = TimeSpan.FromHours(24); // Sync daily

        public WhatsAppSyncWorker(IServiceProvider serviceProvider, ILogger<WhatsAppSyncWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("WhatsAppSyncWorker started.");
            
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var templateService = scope.ServiceProvider.GetRequiredService<IWhatsAppTemplateService>();
                        await templateService.SyncTemplatesAsync();
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error syncing WhatsApp data");
                }
                
                await Task.Delay(_interval, stoppingToken);
            }
        }
    }
}
