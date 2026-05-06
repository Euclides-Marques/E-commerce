using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Queries.GetProducts;

public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, Result<PaginatedResult<ProductSummaryDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetProductsQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<PaginatedResult<ProductSummaryDto>>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .AsNoTracking()
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var search = request.Search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(search) ||
                p.Description.ToLower().Contains(search) ||
                p.SKU.ToLower().Contains(search));
        }

        if (request.CategoryId.HasValue)
        {
            var categoryIds = await GetDescendantCategoryIdsAsync(request.CategoryId.Value, cancellationToken);
            query = query.Where(p => categoryIds.Contains(p.CategoryId));
        }

        if (request.IsActive.HasValue)
            query = query.Where(p => p.IsActive == request.IsActive.Value);

        if (request.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == request.IsFeatured.Value);

        if (request.PriceMin.HasValue)
            query = query.Where(p => p.Price >= request.PriceMin.Value);

        if (request.PriceMax.HasValue)
            query = query.Where(p => p.Price <= request.PriceMax.Value);

        if (request.RatingMin.HasValue)
            query = query.Where(p => p.AverageRating >= request.RatingMin.Value);

        if (request.InStockOnly.HasValue && request.InStockOnly.Value)
            query = query.Where(p => p.StockQuantity > 0);

        query = request.SortBy?.ToLower() switch
        {
            "price" => request.SortDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "name" => request.SortDescending ? query.OrderByDescending(p => p.Name) : query.OrderBy(p => p.Name),
            "sold" => request.SortDescending ? query.OrderByDescending(p => p.SoldCount) : query.OrderBy(p => p.SoldCount),
            "rating" => request.SortDescending ? query.OrderByDescending(p => p.AverageRating) : query.OrderBy(p => p.AverageRating),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var page = Math.Max(request.Page, 1);
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<ProductSummaryDto>>(items);

        return Result<PaginatedResult<ProductSummaryDto>>.Success(
            new PaginatedResult<ProductSummaryDto>(dtos, totalCount, page, pageSize, totalPages));
    }

    private async Task<List<Guid>> GetDescendantCategoryIdsAsync(Guid categoryId, CancellationToken cancellationToken)
    {
        var allCategories = await _context.Categories
            .Select(c => new { c.Id, c.ParentId })
            .ToListAsync(cancellationToken);

        var result = new HashSet<Guid> { categoryId };
        var queue = new Queue<Guid>();
        queue.Enqueue(categoryId);

        while (queue.Count > 0)
        {
            var current = queue.Dequeue();
            var children = allCategories.Where(c => c.ParentId == current).Select(c => c.Id);
            foreach (var child in children)
            {
                if (result.Add(child))
                    queue.Enqueue(child);
            }
        }

        return result.ToList();
    }
}
