using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProductsCursor;

public record GetProductsCursorQuery(
    string? Cursor = null,
    int PageSize = 20,
    string? Search = null,
    Guid? CategoryId = null,
    bool? IsFeatured = null,
    decimal? PriceMin = null,
    decimal? PriceMax = null,
    double? RatingMin = null,
    bool? InStockOnly = null
) : IRequest<Result<CursorPaginatedResult<ProductSummaryDto>>>;
