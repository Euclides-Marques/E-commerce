using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Cart.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Cart.Commands.UpdateCartItem;

public record UpdateCartItemCommand(Guid ProductId, int Quantity) : IRequest<Result<CartDto>>;
