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
            Number = request.Number,
            Description = request.Description,
            ClientId = request.ClientId,
            AssignedToId = request.ResponsibleUserId,
            Court = request.Court,
            DistributionDate = request.DistributionDate,
            Status = CaseStatus.Open
        };

        await _caseRepository.AddAsync(newCase, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new CaseDto(
            newCase.Id,
            newCase.Title,
            newCase.Number,
            newCase.Description,
            newCase.Status.ToString(),
            newCase.ClientId,
            null, // ClientName - would need to fetch
            newCase.AssignedToId,
            null, // ResponsibleName
            newCase.Court,
            newCase.DistributionDate,
            newCase.CreatedAt,
            newCase.UpdatedAt
        );
    }
}
