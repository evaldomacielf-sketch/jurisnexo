using System;
using System.Threading.Tasks;
using JurisNexo.Application.DTOs;
using JurisNexo.Core.Enums;

namespace JurisNexo.Application.Common.Interfaces
{
    public interface IWhatsAppQueueService
    {
        // Queue Operations
        Task<int> EnqueueConversationAsync(Guid conversationId, QueuePriority priority);
        Task<Guid?> DequeueConversationAsync();
        Task<bool> RemoveFromQueueAsync(Guid conversationId);
        Task<int> GetPositionInQueueAsync(Guid conversationId);
        
        // Assignment
        Task<Guid?> AssignNextConversationAsync(Guid advogadoId);
        Task<Guid?> GetNextAvailableAdvogadoAsync();
        Task<bool> TransferConversationAsync(Guid conversationId, Guid toAdvogadoId);
        
        // Advogado Status
        Task<AdvogadoStatus> GetAdvogadoStatusAsync(Guid advogadoId);
        Task SetAdvogadoStatusAsync(Guid advogadoId, AdvogadoStatus status);
        Task<int> GetAdvogadoCurrentLoadAsync(Guid advogadoId);
        Task SetAdvogadoMaxLoadAsync(Guid advogadoId, int maxLoad);
        
        // Statistics
        Task<QueueStatsDto> GetQueueStatsAsync();
        Task<IEnumerable<QueueItemDto>> GetQueueItemsAsync(int take = 50);
        Task<IEnumerable<AdvogadoQueueStatusDto>> GetAdvogadosStatusAsync();
    }
}
