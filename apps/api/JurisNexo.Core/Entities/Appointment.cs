using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public enum AppointmentStatus
{
    Pending,
    Confirmed,
    Cancelled,
    Completed
}

public class Appointment : TenantEntity
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public AppointmentStatus Status { get; set; }
    public bool IsOnline { get; set; }
    public string? MeetLink { get; set; }
    public string? Location { get; set; }
    public Guid? CaseId { get; set; }
    public Guid CreatedBy { get; set; }
    public string? GoogleCalendarEventId { get; set; }
    
    // Navigation properties
    public virtual Case? Case { get; set; }
    public virtual User CreatedByUser { get; set; } = null!;
    public virtual ICollection<AppointmentParticipant> Participants { get; set; } = new List<AppointmentParticipant>();
}
