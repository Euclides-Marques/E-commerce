namespace ECommerce.Application.Features.Categories.DTOs;

public record CategoryDto
{
    public Guid Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? Description { get; init; }
    public string? ImageUrl { get; init; }
    public Guid? ParentId { get; init; }
    public bool IsActive { get; init; }
    public int DisplayOrder { get; init; }
    public List<CategoryDto> Children { get; init; } = [];
}
