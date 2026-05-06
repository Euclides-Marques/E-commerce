namespace ECommerce.Application.Features.Orders.DTOs;

public record OrderItemDto(
    Guid ProductId,
    string ProductName,
    string? ProductImageUrl,
    int Quantity,
    decimal UnitPrice,
    decimal Total
);
