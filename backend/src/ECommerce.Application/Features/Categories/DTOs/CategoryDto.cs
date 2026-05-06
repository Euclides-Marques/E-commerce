namespace ECommerce.Application.Features.Categories.DTOs;

public record CategoryDto(
    Guid Id,
    string Name,
    string Slug,
    string? Description,
    string? ImageUrl,
    Guid? ParentId,
    bool IsActive,
    int DisplayOrder
);
