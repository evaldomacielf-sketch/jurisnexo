using FluentValidation;

namespace JurisNexo.Application.UseCases.Cases.CreateCase;

public class CreateCaseValidator : AbstractValidator<CreateCaseCommand>
{
    public CreateCaseValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("O título é obrigatório.")
            .MaximumLength(200).WithMessage("O título deve ter no máximo 200 caracteres.");

        RuleFor(x => x.CaseNumber)
            .MaximumLength(50).WithMessage("O número deve ter no máximo 50 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.CaseNumber));

        RuleFor(x => x.PracticeArea)
            .MaximumLength(100).WithMessage("A área de prática deve ter no máximo 100 caracteres.")
            .When(x => !string.IsNullOrEmpty(x.PracticeArea));
    }
}
