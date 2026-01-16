using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.DTOs.WhatsApp;
using Microsoft.Extensions.Configuration;

namespace JurisNexo.API.Controllers
{
    [ApiController]
    [Route("api/webhooks/whatsapp")]
    [AllowAnonymous] // Webhook público, valida assinatura manualmente
    public class WhatsAppWebhookController : ControllerBase
    {
        private readonly IWhatsAppMessageProcessor _processor;
        private readonly IWhatsAppWebhookValidator _validator;
        private readonly IConfiguration _configuration;

        public WhatsAppWebhookController(
            IWhatsAppMessageProcessor processor,
            IWhatsAppWebhookValidator validator,
            IConfiguration configuration)
        {
            _processor = processor;
            _validator = validator;
            _configuration = configuration;
        }
        
        // Webhook para receber mensagens (Twilio)
        [HttpPost("twilio")]
        public async Task<IActionResult> TwilioWebhook()
        {
            // 1. Validar assinatura Twilio
            var isValid = _validator.ValidateTwilioSignature(Request);
            if (!isValid)
                return Unauthorized("Invalid signature");
            
            // 2. Ler dados do form (Twilio usa form-urlencoded)
            var form = await Request.ReadFormAsync();
            
            // 3. Processar mensagem de forma assíncrona (fila)
            await _processor.ProcessIncomingMessageAsync(new TwilioWebhookData
            {
                From = form["From"],
                To = form["To"],
                Body = form["Body"],
                MessageSid = form["MessageSid"],
                NumMedia = int.Parse(form["NumMedia"].ToString() == "" ? "0" : form["NumMedia"].ToString()), // Safe parse handling null/empty
                MediaUrl0 = form["MediaUrl0"],
                MediaContentType0 = form["MediaContentType0"]
            });
            
            // 4. Responder OK rapidamente (Twilio espera < 10s)
            return Ok();
        }
        
        // Webhook para receber mensagens (Meta)
        [HttpPost("meta")]
        public async Task<IActionResult> MetaWebhook([FromBody] MetaWebhookPayload payload)
        {
            // 1. Validar assinatura Meta
            var signature = Request.Headers["X-Hub-Signature-256"].ToString();
            var isValid = _validator.ValidateMetaSignature(payload, signature);
            if (!isValid)
                return Unauthorized("Invalid signature");
            
            // 2. Processar cada entrada
            foreach (var entry in payload.Entry)
            {
                foreach (var change in entry.Changes)
                {
                    if (change.Value.Messages != null)
                    {
                        foreach (var message in change.Value.Messages)
                        {
                            await _processor.ProcessIncomingMessageAsync(message);
                        }
                    }
                    
                    // Status de mensagens enviadas
                    if (change.Value.Statuses != null)
                    {
                        foreach (var status in change.Value.Statuses)
                        {
                            await _processor.ProcessMessageStatusAsync(status);
                        }
                    }
                }
            }
            
            return Ok();
        }
        
        // Verificação do webhook (Meta exige)
        [HttpGet("meta")]
        public IActionResult MetaWebhookVerification(
            [FromQuery(Name = "hub.mode")] string mode,
            [FromQuery(Name = "hub.verify_token")] string token,
            [FromQuery(Name = "hub.challenge")] string challenge)
        {
            if (mode == "subscribe" && token == _configuration["WhatsApp:Meta:VerifyToken"])
                return Content(challenge);
            
            return Forbid();
        }
    }
}
