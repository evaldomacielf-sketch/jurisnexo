using System;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.SignalR;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Core.Enums;
using JurisNexo.Infrastructure.Data;
using JurisNexo.Infrastructure.Hubs;

namespace JurisNexo.Infrastructure.Services
{
    public class LGPDConsentService : ILGPDConsentService
    {
        private readonly ApplicationDbContext _context;
        private readonly IWhatsAppClient _whatsAppClient;
        private readonly IHubContext<InboxHub> _hubContext;
        private readonly ILogger<LGPDConsentService> _logger;

        private const string CONSENT_MESSAGE = @"Olá! 👋

Para prosseguirmos com o atendimento, precisamos do seu consentimento para tratamento de dados pessoais conforme a LGPD (Lei Geral de Proteção de Dados).

*Seus dados serão utilizados exclusivamente para:*
• Prestação de serviços jurídicos
• Comunicação sobre seu processo
• Histórico de atendimento

Você pode revogar este consentimento a qualquer momento enviando a palavra REVOGAR.

*Responda SIM para consentir*";

        public LGPDConsentService(
            ApplicationDbContext context,
            IWhatsAppClient whatsAppClient,
            IHubContext<InboxHub> hubContext,
            ILogger<LGPDConsentService> logger)
        {
            _context = context;
            _whatsAppClient = whatsAppClient;
            _hubContext = hubContext;
            _logger = logger;
        }

        /// <summary>
        /// Request consent from a contact
        /// </summary>
        public async Task<bool> RequestConsentAsync(Guid contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null)
            {
                _logger.LogWarning("Contact {ContactId} not found for consent request", contactId);
                return false;
            }

            // Check if already has consent
            if (contact.ConsentStatus == ConsentStatus.Granted)
            {
                _logger.LogInformation("Contact {ContactId} already has consent", contactId);
                return true;
            }

            // Send consent message
            try
            {
                await _whatsAppClient.SendMessageAsync(contact.Phone, CONSENT_MESSAGE);
                
                // Update contact status
                contact.ConsentStatus = ConsentStatus.Pending;
                contact.ConsentRequestedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Consent requested from contact {ContactId}", contactId);
                
                // Log audit
                await LogAuditAsync(contactId, "ConsentRequested", "Solicitação de consentimento LGPD enviada");
                
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to request consent from contact {ContactId}", contactId);
                return false;
            }
        }

        /// <summary>
        /// Process consent response from contact
        /// </summary>
        public async Task<ConsentResult> ProcessConsentResponseAsync(Guid contactId, string message)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null)
            {
                return new ConsentResult
                {
                    Success = false,
                    Action = ConsentAction.InvalidResponse,
                    Message = "Contato não encontrado"
                };
            }

            var normalizedMessage = message.Trim().ToUpperInvariant();

            // Check for consent grant
            if (IsConsentGrant(normalizedMessage))
            {
                contact.ConsentStatus = ConsentStatus.Granted;
                contact.ConsentGrantedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                await LogAuditAsync(contactId, "ConsentGranted", $"Consentimento concedido via WhatsApp: {message}");

                // Send confirmation
                await _whatsAppClient.SendMessageAsync(
                    contact.Phone,
                    "✅ Consentimento registrado! Obrigado. Como posso ajudar?"
                );

                _logger.LogInformation("Contact {ContactId} granted consent", contactId);

                return new ConsentResult
                {
                    Success = true,
                    Action = ConsentAction.Granted,
                    Message = "Consentimento concedido"
                };
            }

            // Check for consent denial
            if (IsConsentDenial(normalizedMessage))
            {
                contact.ConsentStatus = ConsentStatus.Denied;
                contact.ConsentDeniedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();

                await LogAuditAsync(contactId, "ConsentDenied", $"Consentimento negado via WhatsApp: {message}");

                await _whatsAppClient.SendMessageAsync(
                    contact.Phone,
                    "Entendido. Infelizmente não podemos prosseguir sem o consentimento. Caso mude de ideia, entre em contato novamente."
                );

                _logger.LogInformation("Contact {ContactId} denied consent", contactId);

                return new ConsentResult
                {
                    Success = true,
                    Action = ConsentAction.Denied,
                    Message = "Consentimento negado"
                };
            }

            // Check for revocation
            if (IsConsentRevocation(normalizedMessage))
            {
                await RevokeConsentAsync(contactId);

                return new ConsentResult
                {
                    Success = true,
                    Action = ConsentAction.Revoked,
                    Message = "Consentimento revogado"
                };
            }

            // Invalid/ambiguous response
            return new ConsentResult
            {
                Success = false,
                Action = ConsentAction.InvalidResponse,
                Message = "Resposta não reconhecida"
            };
        }

        /// <summary>
        /// Revoke consent for a contact
        /// </summary>
        public async Task RevokeConsentAsync(Guid contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            if (contact == null)
            {
                _logger.LogWarning("Contact {ContactId} not found for consent revocation", contactId);
                return;
            }

            contact.ConsentStatus = ConsentStatus.Revoked;
            contact.ConsentRevokedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            await LogAuditAsync(contactId, "ConsentRevoked", "Consentimento LGPD revogado pelo titular");

            // Notify managers
            await _hubContext.Clients.Group("Managers").SendAsync("ConsentRevoked", new
            {
                contactId,
                contactName = contact.Name,
                phone = contact.Phone,
                revokedAt = DateTime.UtcNow,
                message = $"⚠️ Contato {contact.Name} revogou consentimento LGPD"
            });

            // Send confirmation
            await _whatsAppClient.SendMessageAsync(
                contact.Phone,
                "Consentimento revogado com sucesso. Seus dados serão excluídos em até 30 dias conforme a LGPD."
            );

            _logger.LogInformation("Contact {ContactId} revoked consent", contactId);
        }

        /// <summary>
        /// Export all contact data (LGPD right)
        /// </summary>
        public async Task<byte[]> ExportContactDataAsync(Guid contactId)
        {
            var contact = await _context.Contacts
                .Include(c => c.Cases)
                .FirstOrDefaultAsync(c => c.Id == contactId);

            if (contact == null)
            {
                _logger.LogWarning("Contact {ContactId} not found for data export", contactId);
                return Array.Empty<byte>();
            }

            // Get WhatsApp messages
            var conversations = await _context.WhatsAppConversations
                .Where(c => c.CustomerPhone == contact.Phone)
                .ToListAsync();

            var messages = await _context.WhatsAppMessages
                .Where(m => conversations.Select(c => c.Id).Contains(m.WhatsAppConversationId))
                .OrderBy(m => m.CreatedAt)
                .ToListAsync();

            var exportData = new
            {
                ExportadoEm = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss"),
                DadosPessoais = new
                {
                    Nome = contact.Name,
                    Telefone = contact.Phone,
                    Email = contact.Email,
                    DataCadastro = contact.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                },
                Consentimento = new
                {
                    Status = contact.ConsentStatus.ToString(),
                    SolicitadoEm = contact.ConsentRequestedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                    ConcedidoEm = contact.ConsentGrantedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                    NegadoEm = contact.ConsentDeniedAt?.ToString("yyyy-MM-dd HH:mm:ss"),
                    RevogadoEm = contact.ConsentRevokedAt?.ToString("yyyy-MM-dd HH:mm:ss")
                },
                Processos = contact.Cases?.Select(c => new
                {
                    Numero = c.CaseNumber,
                    Titulo = c.Title,
                    Status = c.Status.ToString(),
                    DataAbertura = c.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
                }),
                MensagensWhatsApp = messages.Select(m => new
                {
                    Data = m.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss"),
                    Direcao = m.Direction.ToString(),
                    Tipo = m.Type.ToString(),
                    Conteudo = m.Content
                })
            };

            await LogAuditAsync(contactId, "DataExported", "Dados pessoais exportados conforme direito LGPD");

            var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            });

            _logger.LogInformation("Data exported for contact {ContactId}", contactId);

            return Encoding.UTF8.GetBytes(json);
        }

        /// <summary>
        /// Check if contact has valid consent
        /// </summary>
        public async Task<bool> HasValidConsentAsync(Guid contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            return contact?.ConsentStatus == ConsentStatus.Granted;
        }

        /// <summary>
        /// Get consent status for a contact
        /// </summary>
        public async Task<ConsentStatusDto> GetConsentStatusAsync(Guid contactId)
        {
            var contact = await _context.Contacts.FindAsync(contactId);
            
            if (contact == null)
            {
                return new ConsentStatusDto
                {
                    Status = ConsentStatus.None,
                    IsValid = false
                };
            }

            return new ConsentStatusDto
            {
                Status = contact.ConsentStatus,
                RequestedAt = contact.ConsentRequestedAt,
                GrantedAt = contact.ConsentGrantedAt,
                DeniedAt = contact.ConsentDeniedAt,
                RevokedAt = contact.ConsentRevokedAt,
                IsValid = contact.ConsentStatus == ConsentStatus.Granted
            };
        }

        #region Helpers

        private bool IsConsentGrant(string message)
        {
            var grantTerms = new[] { "SIM", "ACEITO", "CONCORDO", "OK", "CONSINTO", "AUTORIZO", "PODE" };
            return grantTerms.Any(t => message.Contains(t));
        }

        private bool IsConsentDenial(string message)
        {
            var denyTerms = new[] { "NAO", "NÃO", "RECUSO", "NEGO", "REJEITO" };
            return denyTerms.Any(t => message.Contains(t));
        }

        private bool IsConsentRevocation(string message)
        {
            var revokeTerms = new[] { "REVOGAR", "REVOGO", "RETIRAR", "EXCLUIR", "DELETAR", "APAGAR" };
            return revokeTerms.Any(t => message.Contains(t));
        }

        private Task LogAuditAsync(Guid contactId, string action, string details)
        {
            // Simplified audit logging - log to ILogger
            _logger.LogInformation(
                "LGPD Audit: {Action} for Contact {ContactId} - {Details}",
                action, contactId, details
            );
            return Task.CompletedTask;
        }

        #endregion
    }
}
