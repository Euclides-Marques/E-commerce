using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Cart.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Cart.Commands.RemoveFromCart;

public record RemoveFromCartCommand(Guid ProductId) : IRequest<Result<CartDto>>;
