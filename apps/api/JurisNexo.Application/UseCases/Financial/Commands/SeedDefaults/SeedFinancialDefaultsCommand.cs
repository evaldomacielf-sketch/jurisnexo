using MediatR;
using JurisNexo.Core.Entities.Financial;
using JurisNexo.Core.Interfaces;

namespace JurisNexo.Application.UseCases.Financial.Commands.SeedDefaults;

public record SeedFinancialDefaultsCommand(Guid TenantId) : IRequest<bool>;

public class SeedFinancialDefaultsCommandHandler : IRequestHandler<SeedFinancialDefaultsCommand, bool>
{
    private readonly IRepository<FinancialCategory> _categoryRepository;
    private readonly IRepository<BankAccount> _accountRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IRepository<JurisNexo.Core.Entities.Financial.Transaction> _transactionRepository;

    public SeedFinancialDefaultsCommandHandler(
        IRepository<FinancialCategory> categoryRepository,
        IRepository<BankAccount> accountRepository,
        IRepository<JurisNexo.Core.Entities.Financial.Transaction> transactionRepository,
        IUnitOfWork unitOfWork)
    {
        _categoryRepository = categoryRepository;
        _accountRepository = accountRepository;
        _transactionRepository = transactionRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<bool> Handle(SeedFinancialDefaultsCommand request, CancellationToken cancellationToken)
    {
        // 1. Seed Categories if empty
        var categories = await _categoryRepository.GetAllAsync(cancellationToken); 
        // Note: GetAllAsync is tenant-filtered so this checks ONLY current tenant.
        
        if (!categories.Any())
        {
            var defaultCategories = new List<FinancialCategory>
            {
                new() { Name = "Honorários", Type = "INCOME", Color = "green", TenantId = request.TenantId },
                new() { Name = "Consultoria", Type = "INCOME", Color = "blue", TenantId = request.TenantId },
                new() { Name = "Aluguel", Type = "EXPENSE", Color = "red", TenantId = request.TenantId },
                new() { Name = "Software", Type = "EXPENSE", Color = "purple", TenantId = request.TenantId },
                new() { Name = "Pessoal", Type = "EXPENSE", Color = "orange", TenantId = request.TenantId },
                new() { Name = "Marketing", Type = "EXPENSE", Color = "pink", TenantId = request.TenantId }
            };

            foreach (var cat in defaultCategories)
            {
                await _categoryRepository.AddAsync(cat, cancellationToken);
            }
        }

        // 2. Seed Bank Account if empty
        var accounts = await _accountRepository.GetAllAsync(cancellationToken);
        if (!accounts.Any())
        {
            var defaultAccount = new BankAccount
            {
                Name = "Conta Principal",
                BankName = "Banco Demo",
                AccountNumber = "0001-1",
                InitialBalance = 1000,
                CurrentBalance = 1000,
                TenantId = request.TenantId
            };
            await _accountRepository.AddAsync(defaultAccount, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        // 3. Seed Transactions if empty
        var transactions = await _transactionRepository.GetAllAsync(cancellationToken);
        if (!transactions.Any())
        {
            var cats = await _categoryRepository.GetAllAsync(cancellationToken);
            var incomeCat = cats.FirstOrDefault(c => c.Type == "INCOME");
            var expenseCat = cats.FirstOrDefault(c => c.Type == "EXPENSE");
            var account = (await _accountRepository.GetAllAsync(cancellationToken)).FirstOrDefault();

            if (incomeCat != null && expenseCat != null && account != null)
            {
                 // Transaction 1: Income today
                 var t1 = new JurisNexo.Core.Entities.Financial.Transaction
                 {
                     Description = "Honorários Iniciais",
                     Amount = 5000,
                     Type = TransactionType.Income,
                     Date = DateTime.UtcNow,
                     Status = PaymentStatus.Paid,
                     CategoryId = incomeCat.Id,
                     BankAccountId = account.Id,
                     TenantId = request.TenantId
                 };
                 // Transaction 2: Expense yesterday
                 var t2 = new JurisNexo.Core.Entities.Financial.Transaction
                 {
                     Description = "Pagamento Aluguel",
                     Amount = 1500,
                     Type = TransactionType.Expense,
                     Date = DateTime.UtcNow.AddDays(-1),
                     Status = PaymentStatus.Paid,
                     CategoryId = expenseCat.Id,
                     BankAccountId = account.Id,
                     TenantId = request.TenantId
                 };
                 
                 await _transactionRepository.AddAsync(t1, cancellationToken);
                 await _transactionRepository.AddAsync(t2, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        return true;
    }
}
