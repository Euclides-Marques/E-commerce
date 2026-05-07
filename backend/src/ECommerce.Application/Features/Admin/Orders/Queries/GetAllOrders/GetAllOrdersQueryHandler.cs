using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Admin.Orders.Queries.GetAllOrders;

public class GetAllOrdersQueryHandler : IRequestHandler<GetAllOrdersQuery, Result<PaginatedResult<AdminOrderSummaryDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetAllOrdersQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<PaginatedResult<AdminOrderSummaryDto>>> Handle(GetAllOrdersQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Orders
            .Include(o => o.User)
            .Where(o => !o.IsDeleted)
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Status) &&
            Enum.TryParse<OrderStatus>(request.Status, true, out var status))
            query = query.Where(o => o.Status == status);

        if (request.DateFrom.HasValue)
            query = query.Where(o => o.CreatedAt >= request.DateFrom.Value);

        if (request.DateTo.HasValue)
            query = query.Where(o => o.CreatedAt <= request.DateTo.Value.AddDays(1));

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(o =>
                o.OrderNumber.ToLower().Contains(s) ||
                o.User.Email.ToLower().Contains(s) ||
                (o.User.FirstName + " " + o.User.LastName).ToLower().Contains(s));
        }

        var total = await query.CountAsync(cancellationToken);

        var items = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(o => new AdminOrderSummaryDto(
                o.Id,
                o.OrderNumber,
                o.User.FirstName + " " + o.User.LastName,
                o.User.Email,
                o.Status.ToString(),
                o.Total,
                o.Items.Count,
                o.CreatedAt))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling((double)total / request.PageSize);
        var result = new PaginatedResult<AdminOrderSummaryDto>(items, total, request.Page, request.PageSize, totalPages);

        return Result<PaginatedResult<AdminOrderSummaryDto>>.Success(result);
    }
}
