namespace ECommerce.Application.Features.Products.DTOs;

public record ProductDto(
    Guid Id,
    string Name,
    string Slug,
    string Description,
    string? ShortDescription,
    string SKU,
    decimal Price,
    decimal? OriginalPrice,
    decimal? DiscountPercent,
    int StockQuantity,
    int MinStockAlert,
    decimal Weight,
    bool IsActive,
    bool IsFeatured,
    int SoldCount,
    double AverageRating,
    int ReviewCount,
    Guid CategoryId,
    string CategoryName,
    List<ProductImageDto> Images,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
