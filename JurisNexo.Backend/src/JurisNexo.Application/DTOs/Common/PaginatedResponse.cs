namespace JurisNexo.Application.DTOs.Common;

public record PaginatedResponse<T>(
    List<T> Data,
    PaginationMetadata Pagination
);

public record PaginationMetadata(
    int Page,
    int Limit,
    int Total,
    int TotalPages
);
