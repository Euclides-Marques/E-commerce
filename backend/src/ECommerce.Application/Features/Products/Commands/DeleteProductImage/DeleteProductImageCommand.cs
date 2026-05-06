using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.DeleteProductImage;

public record DeleteProductImageCommand(Guid ImageId) : IRequest<Result>;
