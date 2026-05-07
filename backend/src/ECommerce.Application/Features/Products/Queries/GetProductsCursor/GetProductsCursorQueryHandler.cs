using System.Text;
using System.Text.Json;
using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Queries.GetProductsCursor;

public class GetProductsCursorQueryHandler
    : IRequestHandler<GetProductsCursorQuery, Result<CursorPaginatedResult<ProductSummaryDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    private static readonly JsonSerializerOptions JsonOpts = new() { PropertyNameCaseInsensitive = true };

    public GetProductsCursorQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<CursorPaginatedResult<ProductSummaryDto>>> Handle(
        GetProductsCursorQuery request, CancellationToken cancellationToken)
    {
        var pageSize = Math.Clamp(request.PageSize, 1, 100);

        var query = _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Where(p => p.IsActive)
            .AsNoTracking()
            .AsQueryable();

        // Filtros opcionais
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var s = request.Search.ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(s) ||
                p.Description.ToLower().Contains(s) ||
                p.SKU.ToLower().Contains(s));
        }

        if (request.CategoryId.HasValue)
        {
            var categoryIds = await GetDescendantCategoryIdsAsync(request.CategoryId.Value, cancellationToken);
            query = query.Where(p => categoryIds.Contains(p.CategoryId));
        }

        if (request.PriceMin.HasValue)
            query = query.Where(p => p.Price >= request.PriceMin.Value);

        if (request.PriceMax.HasValue)
            query = query.Where(p => p.Price <= request.PriceMax.Value);

        if (request.RatingMin.HasValue)
            query = query.Where(p => p.AverageRating >= request.RatingMin.Value);

        if (request.InStockOnly == true)
            query = query.Where(p => p.StockQuantity > 0);

        // Decodificar cursor (keyset: CreatedAt DESC, Id DESC)
        if (!string.IsNullOrEmpty(request.Cursor))
        {
            var cursor = DecodeCursor(request.Cursor);
            if (cursor is not null)
            {
                query = query.Where(p =>
                    p.CreatedAt < cursor.CreatedAt ||
                    (p.CreatedAt == cursor.CreatedAt && p.Id.CompareTo(cursor.Id) < 0));
            }
        }

        // Buscar pageSize + 1 para detectar hasMore
        var items = await query
            .OrderByDescending(p => p.CreatedAt)
            .ThenByDescending(p => p.Id)
            .Take(pageSize + 1)
            .ToListAsync(cancellationToken);

        var hasMore = items.Count > pageSize;
        if (hasMore)
            items.RemoveAt(items.Count - 1);

        var dtos = _mapper.Map<List<ProductSummaryDto>>(items);

        string? nextCursor = null;
        if (hasMore && items.Count > 0)
        {
            var last = items[^1];
            nextCursor = EncodeCursor(last.CreatedAt, last.Id);
        }

        return Result<CursorPaginatedResult<ProductSummaryDto>>.Success(
            new CursorPaginatedResult<ProductSummaryDto>(dtos, nextCursor, hasMore));
    }

    private static string EncodeCursor(DateTime createdAt, Guid id)
    {
        var json = JsonSerializer.Serialize(new { CreatedAt = createdAt, Id = id });
        return Convert.ToBase64String(Encoding.UTF8.GetBytes(json));
    }

    private static CursorPayload? DecodeCursor(string cursor)
    {
        try
        {
            var json = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
            return JsonSerializer.Deserialize<CursorPayload>(json, JsonOpts);
        }
        catch
        {
            return null;
        }
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
            foreach (var child in allCategories.Where(c => c.ParentId == current).Select(c => c.Id))
            {
                if (result.Add(child))
                    queue.Enqueue(child);
            }
        }

        return result.ToList();
    }

    private sealed record CursorPayload(DateTime CreatedAt, Guid Id);
}
