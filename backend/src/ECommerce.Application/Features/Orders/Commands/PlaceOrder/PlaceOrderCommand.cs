using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Orders.Commands.PlaceOrder;

public record PlaceOrderCommand(Guid ShippingAddressId, string? Notes = null) : IRequest<Result<OrderDto>>;
