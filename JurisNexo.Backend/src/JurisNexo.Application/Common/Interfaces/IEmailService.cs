namespace JurisNexo.Application.Common.Interfaces;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string email, string name, string code);
    Task SendPasswordResetEmailAsync(string email, string name, string token);
}
