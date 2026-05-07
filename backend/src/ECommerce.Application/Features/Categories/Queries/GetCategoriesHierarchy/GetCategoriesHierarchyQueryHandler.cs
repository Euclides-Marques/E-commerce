using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Categories.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Categories.Queries.GetCategoriesHierarchy;

public class GetCategoriesHierarchyQueryHandler : IRequestHandler<GetCategoriesHierarchyQuery, Result<List<CategoryDto>>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICacheService _cache;

    public GetCategoriesHierarchyQueryHandler(IApplicationDbContext context, IMapper mapper, ICacheService cache)
    {
        _context = context;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<Result<List<CategoryDto>>> Handle(GetCategoriesHierarchyQuery request, CancellationToken cancellationToken)
    {
        var cacheKey = $"categories:hierarchy:{request.IsActive?.ToString() ?? "all"}";

        var cached = await _cache.GetAsync<List<CategoryDto>>(cacheKey, cancellationToken);
        if (cached is not null)
            return Result<List<CategoryDto>>.Success(cached);

        var query = _context.Categories
            .Include(c => c.Children.OrderBy(ch => ch.DisplayOrder).ThenBy(ch => ch.Name))
            .AsNoTracking()
            .Where(c => c.ParentId == null);

        if (request.IsActive.HasValue)
            query = query.Where(c => c.IsActive == request.IsActive.Value);

        var categories = await query
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync(cancellationToken);

        var dtos = _mapper.Map<List<CategoryDto>>(categories);
        await _cache.SetAsync(cacheKey, dtos, TimeSpan.FromMinutes(60), cancellationToken);

        return Result<List<CategoryDto>>.Success(dtos);
    }
}
