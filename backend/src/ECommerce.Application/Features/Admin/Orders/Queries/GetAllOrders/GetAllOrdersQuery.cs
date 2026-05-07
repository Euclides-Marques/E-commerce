using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Admin.Orders.Queries.GetAllOrders;

public record GetAllOrdersQuery(
    string? Status,
    DateTime? DateFrom,
    DateTime? DateTo,
    string? Search,
    int Page = 1,
    int PageSize = 20
) : IRequest<Result<PaginatedResult<AdminOrderSummaryDto>>>;
