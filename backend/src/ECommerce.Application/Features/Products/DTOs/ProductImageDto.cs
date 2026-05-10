namespace ECommerce.Application.Features.Products.DTOs;

public record ProductImageDto
{
    public Guid Id { get; init; }
    public string Url { get; init; } = string.Empty;
    public string? AltText { get; init; }
    public bool IsMain { get; init; }
    public int DisplayOrder { get; init; }
}
