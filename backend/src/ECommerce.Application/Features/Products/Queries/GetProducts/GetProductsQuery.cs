using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProducts;

public record GetProductsQuery(
    int Page = 1,
    int PageSize = 20,
    string? Search = null,
    Guid? CategoryId = null,
    bool? IsActive = null,
    bool? IsFeatured = null,
    string? SortBy = null,
    bool SortDescending = false,
    decimal? PriceMin = null,
    decimal? PriceMax = null,
    double? RatingMin = null,
    bool? InStockOnly = null
) : IRequest<Result<PaginatedResult<ProductSummaryDto>>>;
