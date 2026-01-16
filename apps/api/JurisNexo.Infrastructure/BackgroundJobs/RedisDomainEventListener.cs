using System;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using JurisNexo.Core.Events;

namespace JurisNexo.Infrastructure.BackgroundJobs
{
    public class RedisDomainEventListener : BackgroundService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<RedisDomainEventListener> _logger;

        public RedisDomainEventListener(
            IConnectionMultiplexer redis,
            IServiceProvider serviceProvider,
            ILogger<RedisDomainEventListener> logger)
        {
            _redis = redis;
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var subscriber = _redis.GetSubscriber();

            // Subscribe to channels
            await SubscribeAsync<LeadCreatedEvent>(subscriber, "events:leadcreatedevent");
            await SubscribeAsync<LeadQualifiedEvent>(subscriber, "events:leadqualifiedevent");
            await SubscribeAsync<LeadConvertedEvent>(subscriber, "events:leadconvertedevent");
            await SubscribeAsync<LeadStatusChangedEvent>(subscriber, "events:leadstatuschangedevent");

            _logger.LogInformation("Redis Domain Event Listener started subscribing to channels.");

            // Keep alive
            await Task.Delay(Timeout.Infinite, stoppingToken);
        }

        private async Task SubscribeAsync<TEvent>(ISubscriber subscriber, string channel) where TEvent : class, INotification
        {
            await subscriber.SubscribeAsync(channel, async (redisChannel, message) =>
            {
                try
                {
                    if (message.IsNullOrEmpty) return;

                    var @event = JsonSerializer.Deserialize<TEvent>(message);
                    if (@event != null)
                    {
                        using var scope = _serviceProvider.CreateScope();
                        var publisher = scope.ServiceProvider.GetRequiredService<IPublisher>();
                        await publisher.Publish(@event);
                        _logger.LogInformation($"Dispatched {typeof(TEvent).Name} from Redis to MediatR.");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error processing message from channel {channel}");
                }
            });
        }
    }
}
