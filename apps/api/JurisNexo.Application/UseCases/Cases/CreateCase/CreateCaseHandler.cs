using MediatR;
using JurisNexo.Application.DTOs;
using JurisNexo.Core.Entities;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.UseCases.Cases.CreateCase;

public class CreateCaseHandler : IRequestHandler<CreateCaseCommand, CaseDto>
{
    private readonly ICaseRepository _caseRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateCaseHandler(ICaseRepository caseRepository, IUnitOfWork unitOfWork)
    {
        _caseRepository = caseRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<CaseDto> Handle(CreateCaseCommand request, CancellationToken cancellationToken)
    {
        var newCase = new Case
        {
            Title = request.Title,
            CaseNumber = request.CaseNumber,
            Description = request.Description,
            ClientId = request.ClientId,
            ResponsibleLawyerId = request.ResponsibleLawyerId,
            PracticeArea = request.PracticeArea,
            IsUrgent = request.IsUrgent,
            Status = CaseStatus.Active,
            Tags = request.Tags ?? new List<string>()
        };

        await _caseRepository.AddAsync(newCase, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CaseDto(
            newCase.Id,
            newCase.Title,
            newCase.CaseNumber ?? string.Empty,
            newCase.Description,
            newCase.Status.ToString(),
            newCase.ClientId ?? Guid.Empty,
            null, // ClientName - would need to fetch
            newCase.ResponsibleLawyerId,
            null, // ResponsibleName
            newCase.PracticeArea,
            null, // DistributionDate - not in entity
            newCase.CreatedAt,
            newCase.UpdatedAt
        );
    }
}
