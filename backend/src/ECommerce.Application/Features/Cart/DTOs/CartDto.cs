namespace ECommerce.Application.Features.Cart.DTOs;

public record CartDto(
    List<CartItemDto> Items,
    int TotalItems,
    decimal TotalPrice
);
