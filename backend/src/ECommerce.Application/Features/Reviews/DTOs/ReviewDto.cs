namespace ECommerce.Application.Features.Reviews.DTOs;

public record ReviewDto(
    Guid Id,
    Guid ProductId,
    Guid UserId,
    string UserName,
    int Rating,
    string? Title,
    string? Comment,
    bool IsVerifiedPurchase,
    int HelpfulCount,
    DateTime CreatedAt
);

public record ReviewSummaryDto(
    double AverageRating,
    int TotalCount,
    int[] StarCounts,
    List<ReviewDto> Items,
    int Page,
    int PageSize,
    int TotalPages
);
