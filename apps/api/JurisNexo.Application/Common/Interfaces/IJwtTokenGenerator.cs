using JurisNexo.Core.Entities;

namespace JurisNexo.Application.Common.Interfaces;

public interface IJwtTokenGenerator
{
    string GenerateToken(User user);
    string GenerateRefreshToken();
}
