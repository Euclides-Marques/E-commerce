namespace ECommerce.Application.Features.Products.DTOs;

public record CreateProductDto(
    string Name,
    string Description,
    string? ShortDescription,
    string SKU,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    Guid CategoryId,
    bool IsActive,
    bool IsFeatured,
    decimal Weight
);
