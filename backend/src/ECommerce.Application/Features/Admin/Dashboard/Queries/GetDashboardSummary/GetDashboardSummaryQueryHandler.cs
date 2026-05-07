using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Admin.Dashboard.DTOs;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Admin.Dashboard.Queries.GetDashboardSummary;

public class GetDashboardSummaryQueryHandler : IRequestHandler<GetDashboardSummaryQuery, Result<DashboardSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDashboardSummaryQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<DashboardSummaryDto>> Handle(GetDashboardSummaryQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var cutoff = now.AddDays(-request.DaysBack);
        var last7Days = now.AddDays(-7);

        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .Where(o => !o.IsDeleted)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var totalRevenue = orders
            .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
            .Sum(o => o.Total);

        var recentRevenue = orders
            .Where(o => o.CreatedAt >= cutoff && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
            .Sum(o => o.Total);

        var totalProducts = await _context.Products.CountAsync(p => !p.IsDeleted, cancellationToken);
        var totalUsers = await _context.Users.CountAsync(u => !u.IsDeleted, cancellationToken);

        var topProducts = orders
            .Where(o => o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
            .SelectMany(o => o.Items)
            .GroupBy(i => i.ProductId)
            .Select(g => new TopProductDto(
                g.Key,
                g.First().Product.Name,
                g.Sum(i => i.Quantity),
                g.Sum(i => i.Quantity * i.UnitPrice),
                g.First().Product.Images.FirstOrDefault(img => img.IsMain)?.Url
                    ?? g.First().Product.Images.FirstOrDefault()?.Url))
            .OrderByDescending(p => p.TotalSold)
            .Take(5)
            .ToList();

        var recentOrders = orders
            .OrderByDescending(o => o.CreatedAt)
            .Take(10)
            .Select(o => new AdminOrderSummaryDto(
                o.Id,
                o.OrderNumber,
                o.User.FullName,
                o.User.Email,
                o.Status.ToString(),
                o.Total,
                o.Items.Count,
                o.CreatedAt))
            .ToList();

        var dailySales = Enumerable.Range(0, 7)
            .Select(d => now.AddDays(-d).Date)
            .Select(date => new DailySalesDto(
                date.ToString("yyyy-MM-dd"),
                orders.Count(o => o.CreatedAt.Date == date && o.Status != OrderStatus.Cancelled),
                orders.Where(o => o.CreatedAt.Date == date && o.Status != OrderStatus.Cancelled && o.Status != OrderStatus.Refunded)
                      .Sum(o => o.Total)))
            .OrderBy(d => d.Date)
            .ToList();

        var summary = new DashboardSummaryDto(
            TotalRevenue: totalRevenue,
            TotalOrders: orders.Count,
            TotalProducts: totalProducts,
            TotalUsers: totalUsers,
            PendingOrders: orders.Count(o => o.Status == OrderStatus.Pending),
            PaidOrders: orders.Count(o => o.Status == OrderStatus.Paid),
            ShippedOrders: orders.Count(o => o.Status == OrderStatus.Shipped),
            DeliveredOrders: orders.Count(o => o.Status == OrderStatus.Delivered),
            CancelledOrders: orders.Count(o => o.Status == OrderStatus.Cancelled),
            RecentRevenue: recentRevenue,
            TopProducts: topProducts,
            RecentOrders: recentOrders,
            DailySales: dailySales
        );

        return Result<DashboardSummaryDto>.Success(summary);
    }
}
