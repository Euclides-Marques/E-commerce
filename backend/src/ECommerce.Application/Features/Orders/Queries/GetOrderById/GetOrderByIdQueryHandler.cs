using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Addresses.DTOs;
using ECommerce.Application.Features.Orders.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Queries.GetOrderById;

public class GetOrderByIdQueryHandler : IRequestHandler<GetOrderByIdQuery, Result<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetOrderByIdQueryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<OrderDto>> Handle(GetOrderByIdQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<OrderDto>.Failure("Usuário não autenticado.");

        var order = await _context.Orders
            .Include(o => o.Items)
            .Include(o => o.ShippingAddress)
            .Where(o => o.Id == request.Id && o.UserId == _currentUser.UserId.Value && !o.IsDeleted)
            .AsNoTracking()
            .FirstOrDefaultAsync(cancellationToken);

        if (order is null)
            return Result<OrderDto>.Failure("Pedido não encontrado.");

        var dto = new OrderDto(
            order.Id,
            order.OrderNumber,
            order.Status.ToString(),
            order.Subtotal,
            order.ShippingCost,
            order.Discount,
            order.Total,
            order.CouponCode,
            order.TrackingCode,
            order.Notes,
            order.CreatedAt,
            order.EstimatedDelivery,
            order.DeliveredAt,
            new AddressDto(order.ShippingAddress.Id, order.ShippingAddress.Label, order.ShippingAddress.Recipient,
                order.ShippingAddress.ZipCode, order.ShippingAddress.Street, order.ShippingAddress.Number,
                order.ShippingAddress.Complement, order.ShippingAddress.Neighborhood, order.ShippingAddress.City,
                order.ShippingAddress.State, order.ShippingAddress.Country, order.ShippingAddress.IsDefault),
            order.Items.Select(i => new OrderItemDto(i.ProductId, i.ProductName, i.ProductImageUrl,
                i.Quantity, i.UnitPrice, i.Total)).ToList()
        );

        return Result<OrderDto>.Success(dto);
    }
}
