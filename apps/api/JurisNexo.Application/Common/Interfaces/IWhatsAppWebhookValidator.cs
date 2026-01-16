using JurisNexo.Application.DTOs.WhatsApp;
using Microsoft.AspNetCore.Http;

namespace JurisNexo.Application.Common.Interfaces;

public interface IWhatsAppWebhookValidator
{
    bool ValidateTwilioSignature(HttpRequest request);
    bool ValidateMetaSignature(MetaWebhookPayload payload, string signatureHeader);
}
