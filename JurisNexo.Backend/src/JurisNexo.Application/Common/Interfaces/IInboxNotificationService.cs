using JurisNexo.Domain.Entities;

namespace JurisNexo.Application.Common.Interfaces;

public interface IInboxNotificationService
{
    Task NotifyNewMessageAsync(Guid tenantId, Message message, CancellationToken cancellationToken = default);
}
