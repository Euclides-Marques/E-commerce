using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Wishlist.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Wishlist.Queries.GetWishlist;

public record GetWishlistQuery : IRequest<Result<List<WishlistItemDto>>>;
