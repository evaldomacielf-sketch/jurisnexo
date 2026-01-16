using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Entities;

namespace JurisNexo.Api.Controllers
{
    [ApiController]
    [Route("api/integrations/crm")]
    [Authorize]
    public class CRMIntegrationController : ControllerBase
    {
        private readonly ICRMAutoSyncSettingsService _settingsService;
        private readonly ICRMSyncService _syncService;

        public CRMIntegrationController(ICRMAutoSyncSettingsService settingsService, ICRMSyncService syncService)
        {
            _settingsService = settingsService;
            _syncService = syncService;
        }

        // 1. Obter configurações de auto-sync
        [HttpGet("settings/auto-sync")]
        public async Task<ActionResult<CRMAutoSyncSettings>> GetAutoSyncSettings()
        {
            var escritorioId = GetEscritorioId();
            var settings = await _settingsService.GetAutoSyncSettingsAsync(escritorioId);
            return Ok(settings);
        }

        // 2. Atualizar configurações
        [HttpPut("settings/auto-sync")]
        public async Task<IActionResult> UpdateAutoSyncSettings([FromBody] UpdateAutoSyncSettingsRequest request)
        {
            var escritorioId = GetEscritorioId();
            await _settingsService.UpdateAutoSyncSettingsAsync(escritorioId, request);
            return NoContent();
        }

        // 3. Testar conexão com CRM
        [HttpPost("test-connection/{crmName}")]
        public async Task<ActionResult<TestConnectionResult>> TestConnection(string crmName)
        {
            var result = await _syncService.TestConnectionAsync(crmName);
            return Ok(result);
        }

        // 4. Sincronizar manualmente um lead
        [HttpPost("sync/lead/{leadId}")]
        public async Task<IActionResult> SyncLeadManually(Guid leadId)
        {
            // Ideally check ownership/tenant of lead
            await _syncService.SyncLeadToAllEnabledCRMsAsync(leadId);
            return Ok(new { message = "Lead enfileirado para sincronização" });
        }

        // 5. Ver histórico de sincronizações
        [HttpGet("sync-history")]
        public async Task<ActionResult<List<SyncHistoryDto>>> GetSyncHistory(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null,
            [FromQuery] string? crmName = null)
        {
            var escritorioId = GetEscritorioId();
            var history = await _syncService.GetSyncHistoryAsync(escritorioId, startDate, endDate, crmName);
            return Ok(history);
        }

        // 6. Ver fila de retry
        [HttpGet("sync-queue")]
        public async Task<ActionResult<SyncQueueStatusDto>> GetSyncQueueStatus()
        {
            var status = await _syncService.GetQueueStatusAsync();
            return Ok(status);
        }

        private Guid GetEscritorioId()
        {
            var claim = User.FindFirst("tenant_id");
            if (claim != null && Guid.TryParse(claim.Value, out var id))
            {
                return id;
            }
            // Fallback for dev - typically throws if strict
            return Guid.Empty;
        }
    }
}
