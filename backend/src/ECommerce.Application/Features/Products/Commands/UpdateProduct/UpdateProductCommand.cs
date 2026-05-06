using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.UpdateProduct;

public record UpdateProductCommand(
    Guid Id,
    string Name,
    string Description,
    string? ShortDescription,
    string SKU,
    decimal Price,
    decimal? OriginalPrice,
    int StockQuantity,
    Guid CategoryId,
    bool IsActive,
    bool IsFeatured,
    decimal Weight
) : IRequest<Result<ProductDto>>;
