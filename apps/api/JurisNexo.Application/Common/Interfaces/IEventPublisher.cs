using System.Threading.Tasks;
using JurisNexo.Core.Common;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IEventPublisher
    {
        Task PublishAsync<TEvent>(TEvent @event) where TEvent : DomainEvent;
    }
}
