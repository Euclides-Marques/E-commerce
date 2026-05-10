namespace ECommerce.Application.Features.Products.DTOs;

public record ProductSummaryDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? ShortDescription { get; init; }
    public decimal Price { get; init; }
    public decimal? OriginalPrice { get; init; }
    public decimal? DiscountPercent { get; init; }
    public int StockQuantity { get; init; }
    public bool IsActive { get; init; }
    public bool IsFeatured { get; init; }
    public int SoldCount { get; init; }
    public double AverageRating { get; init; }
    public int ReviewCount { get; init; }
    public string? MainImageUrl { get; init; }
    public Guid CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
}
