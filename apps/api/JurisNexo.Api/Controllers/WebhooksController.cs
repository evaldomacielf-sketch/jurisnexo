using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.WhatsApp;

namespace JurisNexo.API.Controllers;

[ApiController]
[Route("api/webhooks")]
public class WebhooksController : BaseApiController
{
    private readonly IWhatsAppWebhookHandler _webhookHandler;
    private readonly ILogger<WebhooksController> _logger;

    public WebhooksController(
        IWhatsAppWebhookHandler webhookHandler,
        ILogger<WebhooksController> logger)
    {
        _webhookHandler = webhookHandler;
        _logger = logger;
    }

    [HttpPost("whatsapp")]
    [AllowAnonymous]
    public async Task<IActionResult> WhatsAppWebhook(
        [FromBody] WhatsAppWebhookPayload payload,
        CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Webhook WhatsApp recebido: {Event}", payload.Event);

            await _webhookHandler.HandleAsync(payload, cancellationToken);

            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar webhook WhatsApp");
            return StatusCode(500);
        }
    }
}
