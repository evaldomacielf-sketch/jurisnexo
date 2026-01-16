using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs;
using JurisNexo.Domain.Entities;
using JurisNexo.Domain.Enums;
using JurisNexo.Infrastructure.Data;

namespace JurisNexo.Infrastructure.Services
{
    public class WhatsAppQueueService : IWhatsAppQueueService
    {
        private readonly IConnectionMultiplexer _redis;
        private readonly IDatabase _db;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<WhatsAppQueueService> _logger;
        
        // Queue Keys
        private const string QUEUE_WAITING = "whatsapp:queue:waiting";
        private const string QUEUE_ACTIVE = "whatsapp:queue:active";
        private const string QUEUE_PAUSED = "whatsapp:queue:paused";
        private const string ADVOGADO_STATUS_PREFIX = "advogado:status:";
        private const string ADVOGADO_LOAD_PREFIX = "advogado:load:";
        private const string ADVOGADO_MAX_LOAD_PREFIX = "advogado:maxload:";
        private const string ADVOGADOS_BY_LOAD = "advogados:by-load";
        private const string CONVERSATION_ENTERED_AT_PREFIX = "conversation:entered:";

        public WhatsAppQueueService(
            IConnectionMultiplexer redis,
            ApplicationDbContext context,
            ILogger<WhatsAppQueueService> logger)
        {
            _redis = redis;
            _db = redis.GetDatabase();
            _context = context;
            _logger = logger;
        }

        #region Queue Operations

        public async Task<int> EnqueueConversationAsync(Guid conversationId, QueuePriority priority)
        {
            var score = CalculatePriorityScore(priority);
            
            // Store when conversation entered queue
            await _db.StringSetAsync(
                $"{CONVERSATION_ENTERED_AT_PREFIX}{conversationId}",
                DateTime.UtcNow.ToString("O"),
                TimeSpan.FromDays(7)
            );
            
            // Add to sorted set (higher score = higher priority)
            await _db.SortedSetAddAsync(QUEUE_WAITING, conversationId.ToString(), score);
            
            // Publish event for available lawyers
            await _redis.GetSubscriber().PublishAsync(
                RedisChannel.Literal("queue:new-item"),
                conversationId.ToString()
            );
            
            _logger.LogInformation(
                "Conversation {ConversationId} enqueued with priority {Priority}",
                conversationId, priority
            );
            
            // Return position in queue (0-based, descending order)
            var rank = await _db.SortedSetRankAsync(QUEUE_WAITING, conversationId.ToString(), Order.Descending);
            return (int)(rank ?? 0);
        }

        public async Task<Guid?> DequeueConversationAsync()
        {
            var entries = await _db.SortedSetRangeByRankAsync(QUEUE_WAITING, 0, 0, Order.Descending);
            
            if (!entries.Any())
                return null;
                
            var conversationId = Guid.Parse(entries[0]!);
            await _db.SortedSetRemoveAsync(QUEUE_WAITING, entries[0]);
            
            return conversationId;
        }

        public async Task<bool> RemoveFromQueueAsync(Guid conversationId)
        {
            var removed = await _db.SortedSetRemoveAsync(QUEUE_WAITING, conversationId.ToString());
            if (!removed)
                removed = await _db.SortedSetRemoveAsync(QUEUE_ACTIVE, conversationId.ToString());
            
            return removed;
        }

        public async Task<int> GetPositionInQueueAsync(Guid conversationId)
        {
            var rank = await _db.SortedSetRankAsync(QUEUE_WAITING, conversationId.ToString(), Order.Descending);
            return (int)(rank ?? -1);
        }

        #endregion

        #region Assignment

        public async Task<Guid?> AssignNextConversationAsync(Guid advogadoId)
        {
            var status = await GetAdvogadoStatusAsync(advogadoId);
            if (status != AdvogadoStatus.Disponivel)
            {
                _logger.LogWarning("Advogado {AdvogadoId} is not available (status: {Status})", advogadoId, status);
                return null;
            }
            
            var currentLoad = await GetAdvogadoCurrentLoadAsync(advogadoId);
            var maxLoad = await GetAdvogadoMaxLoadAsync(advogadoId);
            
            if (currentLoad >= maxLoad)
            {
                _logger.LogWarning("Advogado {AdvogadoId} is at capacity ({Load}/{Max})", advogadoId, currentLoad, maxLoad);
                return null;
            }
            
            // Get highest priority conversation
            var entries = await _db.SortedSetRangeByScoreWithScoresAsync(
                QUEUE_WAITING,
                order: Order.Descending,
                take: 1
            );
            
            if (!entries.Any())
                return null;
                
            var conversationId = Guid.Parse(entries[0].Element!);
            var score = entries[0].Score;
            
            // Atomic move: remove from waiting, add to active
            var tran = _db.CreateTransaction();
            _ = tran.SortedSetRemoveAsync(QUEUE_WAITING, conversationId.ToString());
            _ = tran.SortedSetAddAsync(QUEUE_ACTIVE, conversationId.ToString(), score);
            await tran.ExecuteAsync();
            
            // Update advogado load
            await IncrementAdvogadoLoadAsync(advogadoId);
            
            // Update conversation in database
            var conversation = await _context.WhatsAppConversations.FindAsync(conversationId);
            if (conversation != null)
            {
                conversation.AssignedToUserId = advogadoId;
                conversation.LastMessageAt = DateTime.UtcNow; // Track assignment time
                await _context.SaveChangesAsync();
            }
            
            _logger.LogInformation(
                "Conversation {ConversationId} assigned to advogado {AdvogadoId}",
                conversationId, advogadoId
            );
            
            return conversationId;
        }

        public async Task<Guid?> GetNextAvailableAdvogadoAsync()
        {
            // Get all lawyers ordered by load (ascending - least loaded first)
            var advogados = await _db.SortedSetRangeByRankAsync(ADVOGADOS_BY_LOAD, 0, -1);
            
            foreach (var advogadoIdStr in advogados)
            {
                var advogadoId = Guid.Parse(advogadoIdStr!);
                
                var status = await GetAdvogadoStatusAsync(advogadoId);
                if (status != AdvogadoStatus.Disponivel)
                    continue;
                    
                var currentLoad = await GetAdvogadoCurrentLoadAsync(advogadoId);
                var maxLoad = await GetAdvogadoMaxLoadAsync(advogadoId);
                
                if (currentLoad < maxLoad)
                    return advogadoId;
            }
            
            return null;
        }

        public async Task<bool> TransferConversationAsync(Guid conversationId, Guid toAdvogadoId)
        {
            var conversation = await _context.WhatsAppConversations.FindAsync(conversationId);
            if (conversation == null) return false;
            
            var previousAdvogadoId = conversation.AssignedToUserId;
            
            // Decrement previous advogado load
            if (previousAdvogadoId.HasValue)
            {
                await DecrementAdvogadoLoadAsync(previousAdvogadoId.Value);
            }
            
            // Increment new advogado load
            await IncrementAdvogadoLoadAsync(toAdvogadoId);
            
            // Update conversation
            conversation.AssignedToUserId = toAdvogadoId;
            conversation.LastMessageAt = DateTime.UtcNow; // Track transfer time
            await _context.SaveChangesAsync();
            
            _logger.LogInformation(
                "Conversation {ConversationId} transferred from {From} to {To}",
                conversationId, previousAdvogadoId, toAdvogadoId
            );
            
            return true;
        }

        #endregion

        #region Advogado Status

        public async Task<AdvogadoStatus> GetAdvogadoStatusAsync(Guid advogadoId)
        {
            var value = await _db.StringGetAsync($"{ADVOGADO_STATUS_PREFIX}{advogadoId}");
            if (value.IsNullOrEmpty)
                return AdvogadoStatus.Offline;
                
            return Enum.Parse<AdvogadoStatus>(value!);
        }

        public async Task SetAdvogadoStatusAsync(Guid advogadoId, AdvogadoStatus status)
        {
            await _db.StringSetAsync(
                $"{ADVOGADO_STATUS_PREFIX}{advogadoId}",
                status.ToString(),
                TimeSpan.FromHours(24)
            );
            
            // If going online, add to load tracking
            if (status == AdvogadoStatus.Disponivel)
            {
                var currentLoad = await GetAdvogadoCurrentLoadAsync(advogadoId);
                await _db.SortedSetAddAsync(ADVOGADOS_BY_LOAD, advogadoId.ToString(), currentLoad);
            }
            else if (status == AdvogadoStatus.Offline)
            {
                await _db.SortedSetRemoveAsync(ADVOGADOS_BY_LOAD, advogadoId.ToString());
            }
        }

        public async Task<int> GetAdvogadoCurrentLoadAsync(Guid advogadoId)
        {
            var value = await _db.StringGetAsync($"{ADVOGADO_LOAD_PREFIX}{advogadoId}");
            return value.IsNullOrEmpty ? 0 : (int)value;
        }

        public async Task SetAdvogadoMaxLoadAsync(Guid advogadoId, int maxLoad)
        {
            await _db.StringSetAsync(
                $"{ADVOGADO_MAX_LOAD_PREFIX}{advogadoId}",
                maxLoad,
                TimeSpan.FromDays(30)
            );
        }

        private async Task<int> GetAdvogadoMaxLoadAsync(Guid advogadoId)
        {
            var value = await _db.StringGetAsync($"{ADVOGADO_MAX_LOAD_PREFIX}{advogadoId}");
            return value.IsNullOrEmpty ? 5 : (int)value; // Default max load = 5
        }

        private async Task IncrementAdvogadoLoadAsync(Guid advogadoId)
        {
            await _db.StringIncrementAsync($"{ADVOGADO_LOAD_PREFIX}{advogadoId}");
            var newLoad = await GetAdvogadoCurrentLoadAsync(advogadoId);
            await _db.SortedSetAddAsync(ADVOGADOS_BY_LOAD, advogadoId.ToString(), newLoad);
        }

        private async Task DecrementAdvogadoLoadAsync(Guid advogadoId)
        {
            await _db.StringDecrementAsync($"{ADVOGADO_LOAD_PREFIX}{advogadoId}");
            var newLoad = await GetAdvogadoCurrentLoadAsync(advogadoId);
            await _db.SortedSetAddAsync(ADVOGADOS_BY_LOAD, advogadoId.ToString(), Math.Max(0, newLoad));
        }

        #endregion

        #region Statistics

        public async Task<QueueStatsDto> GetQueueStatsAsync()
        {
            var waitingItems = await _db.SortedSetRangeByScoreWithScoresAsync(QUEUE_WAITING);
            
            // Count by priority
            var criticalCount = waitingItems.Count(e => e.Score >= 1000000);
            var highCount = waitingItems.Count(e => e.Score >= 100000 && e.Score < 1000000);
            var mediumCount = waitingItems.Count(e => e.Score >= 10000 && e.Score < 100000);
            var lowCount = waitingItems.Count(e => e.Score < 10000);
            
            // Calculate wait times
            var avgWait = 0.0;
            var longestWait = 0.0;
            
            foreach (var item in waitingItems)
            {
                var enteredAt = await _db.StringGetAsync($"{CONVERSATION_ENTERED_AT_PREFIX}{item.Element}");
                if (!enteredAt.IsNullOrEmpty && DateTime.TryParse(enteredAt!, out var entered))
                {
                    var waitMinutes = (DateTime.UtcNow - entered).TotalMinutes;
                    avgWait += waitMinutes;
                    longestWait = Math.Max(longestWait, waitMinutes);
                }
            }
            
            if (waitingItems.Length > 0)
                avgWait /= waitingItems.Length;
            
            // Count advogados by status
            var advogadoIds = await _db.SortedSetRangeByRankAsync(ADVOGADOS_BY_LOAD, 0, -1);
            var disponiveis = 0;
            var ocupados = 0;
            var ausentes = 0;
            
            foreach (var id in advogadoIds)
            {
                var status = await GetAdvogadoStatusAsync(Guid.Parse(id!));
                switch (status)
                {
                    case AdvogadoStatus.Disponivel: disponiveis++; break;
                    case AdvogadoStatus.Ocupado: ocupados++; break;
                    case AdvogadoStatus.Ausente:
                    case AdvogadoStatus.Pausa: ausentes++; break;
                }
            }
            
            return new QueueStatsDto
            {
                WaitingCount = waitingItems.Length,
                ActiveCount = (int)await _db.SortedSetLengthAsync(QUEUE_ACTIVE),
                PausedCount = (int)await _db.SortedSetLengthAsync(QUEUE_PAUSED),
                AvgWaitTimeMinutes = Math.Round(avgWait, 1),
                LongestWaitTimeMinutes = Math.Round(longestWait, 1),
                AdvogadosDisponiveis = disponiveis,
                AdvogadosOcupados = ocupados,
                AdvogadosAusentes = ausentes,
                CriticalInQueue = criticalCount,
                HighInQueue = highCount,
                MediumInQueue = mediumCount,
                LowInQueue = lowCount
            };
        }

        public async Task<IEnumerable<QueueItemDto>> GetQueueItemsAsync(int take = 50)
        {
            var entries = await _db.SortedSetRangeByScoreWithScoresAsync(
                QUEUE_WAITING,
                order: Order.Descending,
                take: take
            );
            
            var items = new List<QueueItemDto>();
            var position = 0;
            
            foreach (var entry in entries)
            {
                var conversationId = Guid.Parse(entry.Element!);
                var conversation = await _context.WhatsAppConversations
                    .FirstOrDefaultAsync(c => c.Id == conversationId);
                    
                if (conversation == null) continue;
                
                var enteredAt = await _db.StringGetAsync($"{CONVERSATION_ENTERED_AT_PREFIX}{conversationId}");
                var enteredTime = DateTime.TryParse(enteredAt!, out var dt) ? dt : DateTime.UtcNow;
                
                items.Add(new QueueItemDto
                {
                    ConversationId = conversationId,
                    CustomerName = conversation.CustomerName ?? "Desconhecido",
                    CustomerPhone = conversation.CustomerPhone ?? "",
                    Priority = GetPriorityFromScore(entry.Score),
                    EnteredQueueAt = enteredTime,
                    PositionInQueue = position++,
                    WaitTimeMinutes = (DateTime.UtcNow - enteredTime).TotalMinutes
                });
            }
            
            return items;
        }

        public async Task<IEnumerable<AdvogadoQueueStatusDto>> GetAdvogadosStatusAsync()
        {
            var advogados = await _context.Users
                .Where(u => u.Role == UserRole.Lawyer || u.Role == UserRole.Admin)
                .Select(u => new { u.Id, u.Name })
                .ToListAsync();
                
            var result = new List<AdvogadoQueueStatusDto>();
            
            foreach (var adv in advogados)
            {
                result.Add(new AdvogadoQueueStatusDto
                {
                    AdvogadoId = adv.Id,
                    Name = adv.Name,
                    Status = await GetAdvogadoStatusAsync(adv.Id),
                    CurrentLoad = await GetAdvogadoCurrentLoadAsync(adv.Id),
                    MaxLoad = await GetAdvogadoMaxLoadAsync(adv.Id)
                });
            }
            
            return result;
        }

        #endregion

        #region Helpers

        private double CalculatePriorityScore(QueuePriority priority)
        {
            var baseScore = DateTime.UtcNow.ToFileTimeUtc() / 10000000.0; // Normalized timestamp
            
            return priority switch
            {
                QueuePriority.Critical => 1000000 + baseScore,
                QueuePriority.High => 100000 + baseScore,
                QueuePriority.Medium => 10000 + baseScore,
                QueuePriority.Low => baseScore,
                _ => baseScore
            };
        }

        private QueuePriority GetPriorityFromScore(double score)
        {
            if (score >= 1000000) return QueuePriority.Critical;
            if (score >= 100000) return QueuePriority.High;
            if (score >= 10000) return QueuePriority.Medium;
            return QueuePriority.Low;
        }

        #endregion
    }
}
