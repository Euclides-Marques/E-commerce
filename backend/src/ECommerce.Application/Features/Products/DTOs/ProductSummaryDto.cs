namespace ECommerce.Application.Features.Products.DTOs;

public record ProductSummaryDto(
    Guid Id,
    string Name,
    string Slug,
    string? ShortDescription,
    decimal Price,
    decimal? OriginalPrice,
    decimal? DiscountPercent,
    int StockQuantity,
    bool IsActive,
    bool IsFeatured,
    int SoldCount,
    double AverageRating,
    int ReviewCount,
    string? MainImageUrl,
    Guid CategoryId,
    string CategoryName
);
