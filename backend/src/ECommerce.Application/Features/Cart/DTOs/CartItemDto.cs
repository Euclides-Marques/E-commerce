namespace ECommerce.Application.Features.Cart.DTOs;

public record CartItemDto(
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    string? ProductImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal Subtotal
);
