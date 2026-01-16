namespace JurisNexo.Application.DTOs;

public record ErrorResponse(string Message);
public record SuccessResponse(bool Success, string Message);
