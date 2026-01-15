using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace JurisNexo.API.BackgroundJobs;

public class WhatsAppMessageWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WhatsAppMessageWorker> _logger;

    public WhatsAppMessageWorker(IServiceProvider serviceProvider, ILogger<WhatsAppMessageWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("WhatsApp Message Worker is starting.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var whatsAppService = scope.ServiceProvider.GetRequiredService<IWhatsAppService>();
                var messageRepository = scope.ServiceProvider.GetRequiredService<IRepository<WhatsAppMessage>>();
                var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();

                // Logic to process queued messages could go here
                // For now, this is a placeholder for the queue processing system
                
                await Task.Delay(5000, stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred executing WhatsApp Message Worker.");
            }
        }

        _logger.LogInformation("WhatsApp Message Worker is stopping.");
    }
}
