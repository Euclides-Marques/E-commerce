using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.SetMainImage;

public record SetMainImageCommand(Guid ImageId, Guid ProductId) : IRequest<Result>;
