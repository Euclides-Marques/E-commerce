namespace ECommerce.Application.Features.Orders.DTOs;

public record OrderSummaryDto(
    Guid Id,
    string OrderNumber,
    string Status,
    decimal Total,
    int ItemCount,
    DateTime CreatedAt
);
