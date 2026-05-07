using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Wishlist.DTOs;
using MediatR;
using WishlistEntity = ECommerce.Domain.Entities.Wishlist;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Wishlist.Commands.ToggleWishlist;

public class ToggleWishlistCommandHandler : IRequestHandler<ToggleWishlistCommand, Result<ToggleWishlistResult>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public ToggleWishlistCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ToggleWishlistResult>> Handle(ToggleWishlistCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<ToggleWishlistResult>.Failure("Usuário não autenticado.");

        var existing = await _context.Wishlists
            .FirstOrDefaultAsync(w => w.UserId == _currentUser.UserId.Value && w.ProductId == request.ProductId, cancellationToken);

        if (existing is not null)
        {
            _context.Wishlists.Remove(existing);
            await _context.SaveChangesAsync(cancellationToken);
            return Result<ToggleWishlistResult>.Success(new ToggleWishlistResult(false));
        }

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        if (product is null)
            return Result<ToggleWishlistResult>.Failure("Produto não encontrado.");

        var wishlistItem = new WishlistEntity
        {
            UserId = _currentUser.UserId.Value,
            ProductId = request.ProductId,
            AddedAt = DateTime.UtcNow
        };

        await _context.Wishlists.AddAsync(wishlistItem, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return Result<ToggleWishlistResult>.Success(new ToggleWishlistResult(true));
    }
}
