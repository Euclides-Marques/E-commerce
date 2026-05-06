using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Cart.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Cart.Queries.GetCart;

public class GetCartQueryHandler : IRequestHandler<GetCartQuery, Result<CartDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetCartQueryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<CartDto>> Handle(GetCartQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<CartDto>.Failure("Usuário não autenticado.");

        var items = await _context.CartItems
            .Include(c => c.Product)
                .ThenInclude(p => p.Images)
            .Where(c => c.UserId == _currentUser.UserId.Value)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var dtos = items.Select(c => new CartItemDto(
            c.ProductId,
            c.Product.Name,
            c.Product.Slug,
            c.Product.Images.FirstOrDefault(i => i.IsMain)?.Url ?? c.Product.Images.FirstOrDefault()?.Url,
            c.Product.GetDiscountedPrice(),
            c.Quantity,
            c.Product.GetDiscountedPrice() * c.Quantity
        )).ToList();

        var cart = new CartDto(dtos, dtos.Sum(i => i.Quantity), dtos.Sum(i => i.Subtotal));
        return Result<CartDto>.Success(cart);
    }
}
