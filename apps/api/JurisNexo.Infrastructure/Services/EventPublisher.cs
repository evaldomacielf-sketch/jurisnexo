using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Common;

namespace JurisNexo.Infrastructure.Services
{
    public class EventPublisher : IEventPublisher
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<EventPublisher> _logger;

        public EventPublisher(IConnectionMultiplexer redis, ILogger<EventPublisher> logger)
        {
            _redis = redis;
            _logger = logger;
        }

        public async Task PublishAsync<TEvent>(TEvent @event) where TEvent : DomainEvent
        {
            var subscriber = _redis.GetSubscriber();
            var channel = GetChannelName<TEvent>();
            var message = JsonSerializer.Serialize(@event);

            await subscriber.PublishAsync(channel, message);

            _logger.LogInformation(
                "Event {EventType} published to Redis channel {Channel}: {EventId}",
                typeof(TEvent).Name,
                channel,
                @event.EventId);
        }

        private string GetChannelName<TEvent>() where TEvent : DomainEvent
        {
            return $"events:{typeof(TEvent).Name.ToLower()}";
        }
    }
}
