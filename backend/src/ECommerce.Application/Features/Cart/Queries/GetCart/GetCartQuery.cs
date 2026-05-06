using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Cart.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Cart.Queries.GetCart;

public record GetCartQuery : IRequest<Result<CartDto>>;
