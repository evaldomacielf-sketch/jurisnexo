using MediatR;
using JurisNexo.Core.Entities.Financial;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.UseCases.Financial.Commands.CreateTransaction;

public class CreateTransactionCommandHandler : IRequestHandler<CreateTransactionCommand, Guid>
{
    private readonly ITransactionRepository _transactionRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CreateTransactionCommandHandler(ITransactionRepository transactionRepository, IUnitOfWork unitOfWork)
    {
        _transactionRepository = transactionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Guid> Handle(CreateTransactionCommand request, CancellationToken cancellationToken)
    {
        if (!Enum.TryParse<TransactionType>(request.Type, true, out var typeEnum))
        {
            throw new ArgumentException($"Invalid transaction type: {request.Type}");
        }

        if (!Enum.TryParse<PaymentStatus>(request.Status, true, out var statusEnum))
        {
            statusEnum = PaymentStatus.Pending;
        }

        var entity = new Transaction
        {
            Description = request.Description,
            Amount = request.Amount,
            Type = typeEnum,
            Date = request.Date.ToUniversalTime(), // Ensure UTC
            CategoryId = request.CategoryId,
            BankAccountId = request.BankAccountId,
            Status = statusEnum,
            TenantId = request.TenantId
        };

        await _transactionRepository.AddAsync(entity, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return entity.Id;
    }
}
