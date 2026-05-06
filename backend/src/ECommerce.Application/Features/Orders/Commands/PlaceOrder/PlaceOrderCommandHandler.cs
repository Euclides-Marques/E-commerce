using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Orders.DTOs;
using ECommerce.Application.Features.Orders.Queries.GetOrderById;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Orders.Commands.PlaceOrder;

public class PlaceOrderCommandHandler : IRequestHandler<PlaceOrderCommand, Result<OrderDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly ISender _sender;

    public PlaceOrderCommandHandler(IApplicationDbContext context, ICurrentUser currentUser, ISender sender)
    {
        _context = context;
        _currentUser = currentUser;
        _sender = sender;
    }

    public async Task<Result<OrderDto>> Handle(PlaceOrderCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<OrderDto>.Failure("Usuário não autenticado.");

        var address = await _context.Addresses.FirstOrDefaultAsync(
            a => a.Id == request.ShippingAddressId && a.UserId == _currentUser.UserId.Value && !a.IsDeleted,
            cancellationToken);
        if (address is null)
            return Result<OrderDto>.Failure("Endereço não encontrado.");

        var cartItems = await _context.CartItems
            .Include(c => c.Product).ThenInclude(p => p.Images)
            .Where(c => c.UserId == _currentUser.UserId.Value)
            .ToListAsync(cancellationToken);

        if (cartItems.Count == 0)
            return Result<OrderDto>.Failure("Carrinho está vazio.");

        foreach (var item in cartItems)
        {
            if (!item.Product.IsActive)
                return Result<OrderDto>.Failure($"Produto '{item.Product.Name}' não está disponível.");
            if (item.Product.StockQuantity < item.Quantity)
                return Result<OrderDto>.Failure($"Estoque insuficiente para '{item.Product.Name}'.");
        }

        var orderNumber = $"ORD-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";
        var subtotal = cartItems.Sum(c => c.Product.GetDiscountedPrice() * c.Quantity);
        const decimal shippingCost = 0m;

        var order = new Order
        {
            OrderNumber = orderNumber,
            UserId = _currentUser.UserId.Value,
            ShippingAddressId = address.Id,
            Subtotal = subtotal,
            ShippingCost = shippingCost,
            Discount = 0,
            Total = subtotal + shippingCost,
            Notes = request.Notes,
            EstimatedDelivery = DateTime.UtcNow.AddDays(7),
        };

        foreach (var item in cartItems)
        {
            var mainImage = item.Product.Images.FirstOrDefault(i => i.IsMain)?.Url
                ?? item.Product.Images.FirstOrDefault()?.Url;

            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = item.Product.Name,
                ProductImageUrl = mainImage,
                Quantity = item.Quantity,
                UnitPrice = item.Product.GetDiscountedPrice(),
            });

            item.Product.StockQuantity -= item.Quantity;
            item.Product.SoldCount += item.Quantity;
        }

        await _context.Orders.AddAsync(order, cancellationToken);
        _context.CartItems.RemoveRange(cartItems);
        await _context.SaveChangesAsync(cancellationToken);

        return await _sender.Send(new GetOrderByIdQuery(order.Id), cancellationToken);
    }
}
