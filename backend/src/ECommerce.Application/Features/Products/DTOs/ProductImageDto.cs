namespace ECommerce.Application.Features.Products.DTOs;

public record ProductImageDto(
    Guid Id,
    string Url,
    string? AltText,
    bool IsMain,
    int DisplayOrder
);
