using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Queries.GetProductBySlug;

public class GetProductBySlugQueryHandler : IRequestHandler<GetProductBySlugQuery, Result<ProductDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public GetProductBySlugQueryHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<ProductDto>> Handle(GetProductBySlugQuery request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images.OrderBy(i => i.DisplayOrder))
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Slug == request.Slug, cancellationToken);

        if (product is null)
            return Result<ProductDto>.Failure("Produto não encontrado.");

        return Result<ProductDto>.Success(_mapper.Map<ProductDto>(product));
    }
}
