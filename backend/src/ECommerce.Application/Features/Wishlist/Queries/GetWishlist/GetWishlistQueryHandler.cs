using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Wishlist.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Wishlist.Queries.GetWishlist;

public class GetWishlistQueryHandler : IRequestHandler<GetWishlistQuery, Result<List<WishlistItemDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public GetWishlistQueryHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<List<WishlistItemDto>>> Handle(GetWishlistQuery request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<List<WishlistItemDto>>.Failure("Usuário não autenticado.");

        var items = await _context.Wishlists
            .Where(w => w.UserId == _currentUser.UserId.Value)
            .Include(w => w.Product).ThenInclude(p => p.Images)
            .AsNoTracking()
            .OrderByDescending(w => w.AddedAt)
            .Select(w => new WishlistItemDto(
                w.ProductId,
                w.Product.Name,
                w.Product.Slug,
                w.Product.Price,
                w.Product.OriginalPrice,
                w.Product.Images.Where(i => i.IsMain).Select(i => i.Url).FirstOrDefault()
                    ?? w.Product.Images.Select(i => i.Url).FirstOrDefault(),
                w.Product.AverageRating,
                w.Product.ReviewCount,
                w.Product.StockQuantity > 0,
                w.AddedAt
            ))
            .ToListAsync(cancellationToken);

        return Result<List<WishlistItemDto>>.Success(items);
    }
}
