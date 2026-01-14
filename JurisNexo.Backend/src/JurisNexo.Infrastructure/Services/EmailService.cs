using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using JurisNexo.Application.Common.Interfaces;
using JurisNexo.Application.Common.Settings;

namespace JurisNexo.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly SmtpSettings _smtpSettings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<SmtpSettings> smtpSettings, ILogger<EmailService> logger)
    {
        _smtpSettings = smtpSettings.Value;
        _logger = logger;
    }

    public async Task SendVerificationEmailAsync(string email, string name, string code)
    {
        var subject = "Verificação de E-mail - JurisNexo";
        var body = $@"
            <h2>Olá, {name}!</h2>
            <p>Seu código de verificação é: <strong>{code}</strong></p>
            <p>Este código expira em 24 horas.</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    public async Task SendPasswordResetEmailAsync(string email, string name, string token)
    {
        var resetLink = $"{_smtpSettings.FrontendUrl}/auth/reset-password?token={token}";
        var subject = "Redefinição de Senha - JurisNexo";
        var body = $@"
            <h2>Olá, {name}!</h2>
            <p>Você solicitou a redefinição de senha.</p>
            <p><a href=""{resetLink}"">Clique aqui para redefinir sua senha</a></p>
            <p>Este link expira em 2 horas.</p>
        ";

        await SendEmailAsync(email, subject, body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            using var client = new SmtpClient(_smtpSettings.Host, _smtpSettings.Port)
            {
                Credentials = new NetworkCredential(_smtpSettings.Username, _smtpSettings.Password),
                EnableSsl = true
            };

            var message = new MailMessage
            {
                From = new MailAddress(_smtpSettings.FromEmail, _smtpSettings.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(to);

            await client.SendMailAsync(message);
            _logger.LogInformation("E-mail enviado para {Email}", to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao enviar e-mail para {Email}", to);
            // Dependendo da estratégia de resiliência, pode não querer relançar a exceção para não bloquear o fluxo principal?
            // Mas o request original pede throw; então mantenho.
            throw;
        }
    }
}
