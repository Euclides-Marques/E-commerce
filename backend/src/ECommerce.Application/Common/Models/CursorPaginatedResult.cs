namespace ECommerce.Application.Common.Models;

public record CursorPaginatedResult<T>(
    List<T> Items,
    string? NextCursor,
    bool HasMore
);
