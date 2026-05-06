using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Orders.Queries.GetOrders;

public record GetOrdersQuery : IRequest<Result<List<OrderSummaryDto>>>;
