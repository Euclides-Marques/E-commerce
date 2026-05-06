using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Cart.Commands.ClearCart;

public record ClearCartCommand : IRequest<Result>;
