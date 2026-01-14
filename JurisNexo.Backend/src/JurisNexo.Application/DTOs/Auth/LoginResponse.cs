using JurisNexo.Application.DTOs;

namespace JurisNexo.Application.DTOs.Auth;

public record LoginResponse(
    string Token,
    string RefreshToken,
    UserDto User,
    int ExpiresIn
);
