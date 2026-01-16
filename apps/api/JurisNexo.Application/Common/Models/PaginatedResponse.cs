namespace JurisNexo.Application.Common.Models;

public class PaginatedResponse<T>
{
    public IEnumerable<T> Items { get; }
    public PaginationMetadata Metadata { get; }

    public PaginatedResponse(IEnumerable<T> items, PaginationMetadata metadata)
    {
        Items = items;
        Metadata = metadata;
    }
}

public class PaginationMetadata
{
    public int CurrentPage { get; }
    public int PageSize { get; }
    public int TotalCount { get; }
    public int TotalPages { get; }
    public bool HasPrevious => CurrentPage > 1;
    public bool HasNext => CurrentPage < TotalPages;

    public PaginationMetadata(int currentPage, int pageSize, int totalCount, int totalPages)
    {
        CurrentPage = currentPage;
        PageSize = pageSize;
        TotalCount = totalCount;
        TotalPages = totalPages;
    }
}
