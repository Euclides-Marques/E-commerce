using ECommerce.Application.Features.Addresses.DTOs;

namespace ECommerce.Application.Features.Orders.DTOs;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    string Status,
    decimal Subtotal,
    decimal ShippingCost,
    decimal Discount,
    decimal Total,
    string? CouponCode,
    string? TrackingCode,
    string? Notes,
    DateTime CreatedAt,
    DateTime? EstimatedDelivery,
    DateTime? DeliveredAt,
    AddressDto ShippingAddress,
    List<OrderItemDto> Items
);
