using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Orders.Queries.GetOrderById;

public record GetOrderByIdQuery(Guid Id) : IRequest<Result<OrderDto>>;
