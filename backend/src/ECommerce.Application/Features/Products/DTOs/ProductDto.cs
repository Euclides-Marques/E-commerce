namespace ECommerce.Application.Features.Products.DTOs;

public record ProductDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public string SKU { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? OriginalPrice { get; init; }
    public decimal? DiscountPercent { get; init; }
    public int StockQuantity { get; init; }
    public int MinStockAlert { get; init; }
    public decimal Weight { get; init; }
    public bool IsActive { get; init; }
    public bool IsFeatured { get; init; }
    public int SoldCount { get; init; }
    public double AverageRating { get; init; }
    public int ReviewCount { get; init; }
    public Guid CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public List<ProductImageDto> Images { get; init; } = [];
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
