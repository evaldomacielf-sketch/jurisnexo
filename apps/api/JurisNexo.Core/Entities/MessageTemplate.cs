using JurisNexo.Core.Common;

namespace JurisNexo.Core.Entities;

public class MessageTemplate : TenantEntity
{
    public string Name { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}
