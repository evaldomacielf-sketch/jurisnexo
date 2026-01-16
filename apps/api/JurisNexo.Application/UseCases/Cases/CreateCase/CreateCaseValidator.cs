using FluentValidation;

namespace JurisNexo.Application.UseCases.Cases.CreateCase;

public class CreateCaseValidator : AbstractValidator<CreateCaseCommand>
{
    public CreateCaseValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("O título é obrigatório.")
            .MaximumLength(200).WithMessage("O título deve ter no máximo 200 caracteres.");

        RuleFor(x => x.Number)
            .NotEmpty().WithMessage("O número do processo é obrigatório.")
            .MaximumLength(50).WithMessage("O número deve ter no máximo 50 caracteres.");

        RuleFor(x => x.ClientId)
            .NotEmpty().WithMessage("O cliente é obrigatório.");
    }
}
