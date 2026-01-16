using System;
using MediatR;

namespace JurisNexo.Core.Common
{
    public abstract class DomainEvent : INotification
    {
        public Guid EventId { get; } = Guid.NewGuid();
        public DateTime OccurredAt { get; } = DateTime.UtcNow;
        public bool IsPublished { get; set; }
    }
}
