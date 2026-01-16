using Swashbuckle.AspNetCore.Filters;
using JurisNexo.Application.DTOs.Auth;

using JurisNexo.Application.DTOs.Case;
using JurisNexo.Application.DTOs.Contact;

namespace JurisNexo.Application.DTOs.Examples;

public class LoginRequestExample : IExamplesProvider<LoginRequest>
{
    public LoginRequest GetExamples()
    {
        return new LoginRequest
        {
            Email = "joao.silva@exemplo.com",
            Password = "SenhaSegura123!"
        };
    }
}

public class RegisterRequestExample : IExamplesProvider<RegisterRequest>
{
    public RegisterRequest GetExamples()
    {
        return new RegisterRequest
        {
            Email = "maria.santos@exemplo.com",
            Password = "SenhaSegura123!",
            Name = "Maria Santos",
            FirmName = "Santos & Advogados Associados",
            Phone = "11987654321"
        };
    }
}

public class CreateContactRequestExample : IExamplesProvider<CreateContactRequest>
{
    public CreateContactRequest GetExamples()
    {
        return new CreateContactRequest(
            Name: "Pedro Oliveira",
            Phone: "11999887766",
            Email: "pedro.oliveira@email.com",
            Cpf: "123.456.789-00",
            Address: "Rua das Flores, 123",
            City: "São Paulo",
            State: "SP",
            ZipCode: "01234-567",
            Source: "whatsapp",
            Tags: new List<string> { "VIP", "Trabalhista" },
            Notes: "Cliente interessado em ação trabalhista",
            IsLead: true
        );
    }
}

public class CreateCaseRequestExample : IExamplesProvider<CreateCaseRequest>
{
    public CreateCaseRequest GetExamples()
    {
        return new CreateCaseRequest(
            CaseNumber: "0001234-56.2024.8.26.0100",
            Title: "Ação Trabalhista - Horas Extras",
            Description: "Reclamação trabalhista referente a horas extras não pagas no período de 2022-2023",
            Status: "active",
            PracticeArea: "Trabalhista",
            IsUrgent: false,
            ClientId: Guid.Parse("550e8400-e29b-41d4-a716-446655440000"),
            ResponsibleLawyerId: Guid.Parse("660e8400-e29b-41d4-a716-446655440000"),
            Tags: new List<string> { "Horas Extras", "Primeira Instância" }
        );
    }
}
