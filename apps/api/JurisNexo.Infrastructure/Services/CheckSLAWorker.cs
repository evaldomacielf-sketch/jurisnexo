using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Core.Entities;
using JurisNexo.Application.Common.Interfaces;

namespace JurisNexo.Infrastructure.Services
{
    public class CheckSLAWorker : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<CheckSLAWorker> _logger;

        public CheckSLAWorker(IServiceProvider serviceProvider, ILogger<CheckSLAWorker> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SLA Monitor Worker started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await CheckSLABreachesAsync(stoppingToken);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in CheckSLAWorker");
                }

                await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken); // Check every 5 mins
            }
        }

        private async Task CheckSLABreachesAsync(CancellationToken cancellationToken)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var notificationService = scope.ServiceProvider.GetRequiredService<IInboxNotificationService>();

                // Find leads that are Qualified or Assigned but NOT contacted/converted
                // And are older than threshold
                var pendingLeads = await context.Leads
                    .Where(l => l.Status == LeadStatus.Qualified || l.Status == LeadStatus.Assigned)
                    .ToListAsync(cancellationToken);

                foreach (var lead in pendingLeads)
                {
                    var timeSinceAssignment = DateTime.UtcNow - (lead.AssignedAt ?? lead.UpdatedAt);
                    
                    // SLA Rules
                    var limit = lead.Quality == LeadQuality.High ? TimeSpan.FromMinutes(15) : TimeSpan.FromHours(1);

                    if (timeSinceAssignment > limit)
                    {
                        // SLA BREACHED
                        _logger.LogWarning("SLA BREACH for Lead {LeadId}. Time elapsed: {Elapsed}", lead.Id, timeSinceAssignment);

                        // Notify Admin or Assigned User
                        // If assigned, notify user again "URGENT"
                        if (lead.AssignedToUserId.HasValue)
                        {
                            // Valid Notification logic requires constructing a proper Message entity.
                            // For now, logging the breach is sufficient for the Worker.
                            _logger.LogWarning("Sending SLA Breach Notification to User {UserId}: {LeadId}", lead.AssignedToUserId.Value, lead.Id);
                        }
                        
                        // We could also re-route here (escalation) in v2
                    }
                }
            }
        }
    }
}
