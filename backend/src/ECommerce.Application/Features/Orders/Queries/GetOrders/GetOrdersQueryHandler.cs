using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Queries.GetOrders;

public class GetOrdersQueryHandler : IRequestHandler<GetOrdersQuery, Result<List<OrderSummaryDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetOrdersQueryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<OrderSummaryDto>>> Handle(GetOrdersQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<List<OrderSummaryDto>>.Failure("Usuário não autenticado.");

        var orders = await _context.Orders
            .Where(o => o.UserId == _currentUser.UserId.Value && !o.IsDeleted)
            .OrderByDescending(o => o.CreatedAt)
            .AsNoTracking()
            .Select(o => new OrderSummaryDto(
                o.Id,
                o.OrderNumber,
                o.Status.ToString(),
                o.Total,
                o.Items.Count,
                o.CreatedAt))
            .ToListAsync(cancellationToken);

        return Result<List<OrderSummaryDto>>.Success(orders);
    }
}
