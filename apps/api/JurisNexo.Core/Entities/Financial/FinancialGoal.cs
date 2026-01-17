using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities.Financial;

public class FinancialGoal : TenantEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    
    public FinancialGoalStatus Status { get; set; } = FinancialGoalStatus.Active;
    
    // Computed property
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public decimal ProgressPercentage => TargetAmount > 0 
        ? Math.Min(100, Math.Round((CurrentAmount / TargetAmount) * 100, 2)) 
        : 0;
    
    [System.ComponentModel.DataAnnotations.Schema.NotMapped]
    public int DaysRemaining => Math.Max(0, (EndDate - DateTime.UtcNow).Days);
}

public enum FinancialGoalStatus
{
    Active,
    Completed,
    Cancelled
}
