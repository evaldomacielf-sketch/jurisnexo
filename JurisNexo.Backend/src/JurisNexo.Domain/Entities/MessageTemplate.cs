using JurisNexo.Domain.Common;

namespace JurisNexo.Domain.Entities;

public class MessageTemplate : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
