using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.SetProductFeatured;

public record SetProductFeaturedCommand(
    Guid Id,
    bool IsFeatured
) : IRequest<Result<ProductSummaryDto>>;
