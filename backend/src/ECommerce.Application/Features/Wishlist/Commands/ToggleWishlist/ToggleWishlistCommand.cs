using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Wishlist.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Wishlist.Commands.ToggleWishlist;

public record ToggleWishlistCommand(Guid ProductId) : IRequest<Result<ToggleWishlistResult>>;
