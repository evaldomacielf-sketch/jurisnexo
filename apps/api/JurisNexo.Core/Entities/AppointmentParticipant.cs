using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public enum ParticipantType
{
    Client,
    Lawyer,
    External
}

public class AppointmentParticipant : BaseEntity
{
    public Guid AppointmentId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ParticipantType Type { get; set; }
    
    // Navigation properties
    public virtual Appointment Appointment { get; set; } = null!;
}
