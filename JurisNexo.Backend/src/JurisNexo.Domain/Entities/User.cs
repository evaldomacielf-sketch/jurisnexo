using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public enum UserRole
{
    Admin,
    Lawyer,
    Assistant,
    Client
}

public class User : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? AvatarUrl { get; set; }
    public UserRole Role { get; set; }
    public bool IsEmailVerified { get; set; }
    public string? EmailVerificationCode { get; set; }
    public DateTime? EmailVerificationCodeExpiresAt { get; set; }
    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiresAt { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiresAt { get; set; }
    
    // Navigation properties
    public virtual ICollection<Appointment> CreatedAppointments { get; set; } = new List<Appointment>();
    public virtual ICollection<Case> ResponsibleCases { get; set; } = new List<Case>();
}
