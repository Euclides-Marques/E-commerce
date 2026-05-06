using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Cart.DTOs;
using ECommerce.Application.Features.Cart.Queries.GetCart;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Commands.AddToCart;

public class AddToCartCommandHandler : IRequestHandler<AddToCartCommand, Result<CartDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;
    private readonly ISender _sender;

    public AddToCartCommandHandler(IApplicationDbContext context, ICurrentUser currentUser, ISender sender)
    {
        _context = context;
        _currentUser = currentUser;
        _sender = sender;
    }

    public async Task<Result<CartDto>> Handle(AddToCartCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<CartDto>.Failure("Usuário não autenticado.");

        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        if (product is null)
            return Result<CartDto>.Failure("Produto não encontrado.");

        if (!product.IsActive)
            return Result<CartDto>.Failure("Produto indisponível.");

        if (product.StockQuantity <= 0)
            return Result<CartDto>.Failure("Produto sem estoque.");

        var existing = await _context.CartItems
            .FirstOrDefaultAsync(c => c.UserId == _currentUser.UserId.Value && c.ProductId == request.ProductId, cancellationToken);

        if (existing is not null)
        {
            existing.Quantity += request.Quantity;
        }
        else
        {
            var item = new CartItem
            {
                UserId = _currentUser.UserId.Value,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                AddedAt = DateTime.UtcNow
            };
            await _context.CartItems.AddAsync(item, cancellationToken);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return await _sender.Send(new GetCartQuery(), cancellationToken);
    }
}
