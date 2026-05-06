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

    public GetCategoriesHierarchyQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<List<CategoryDto>>> Handle(GetCategoriesHierarchyQuery request, CancellationToken cancellationToken)
    {
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

        return Result<List<CategoryDto>>.Success(_mapper.Map<List<CategoryDto>>(categories));
    }
}
