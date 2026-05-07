namespace ECommerce.Application.Features.Admin.Dashboard.DTOs;

public record DashboardSummaryDto(
    decimal TotalRevenue,
    int TotalOrders,
    int TotalProducts,
    int TotalUsers,
    int PendingOrders,
    int PaidOrders,
    int ShippedOrders,
    int DeliveredOrders,
    int CancelledOrders,
    decimal RecentRevenue,
    List<TopProductDto> TopProducts,
    List<AdminOrderSummaryDto> RecentOrders,
    List<DailySalesDto> DailySales
);

public record TopProductDto(
    Guid ProductId,
    string ProductName,
    int TotalSold,
    decimal TotalRevenue,
    string? ImageUrl
);

public record DailySalesDto(
    string Date,
    int TotalOrders,
    decimal TotalRevenue
);

public record AdminOrderSummaryDto(
    Guid Id,
    string OrderNumber,
    string UserName,
    string UserEmail,
    string Status,
    decimal Total,
    int ItemCount,
    DateTime CreatedAt
);

public record AdminUserDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    bool IsActive,
    bool EmailConfirmed,
    DateTime CreatedAt,
    int OrdersCount
);
