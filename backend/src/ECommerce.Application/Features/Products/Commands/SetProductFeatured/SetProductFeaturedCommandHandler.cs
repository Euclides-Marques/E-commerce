using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Commands.SetProductFeatured;

public class SetProductFeaturedCommandHandler : IRequestHandler<SetProductFeaturedCommand, Result<ProductSummaryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public SetProductFeaturedCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<ProductSummaryDto>> Handle(SetProductFeaturedCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product is null)
            return Result<ProductSummaryDto>.Failure("Produto não encontrado.");

        product.IsFeatured = request.IsFeatured;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<ProductSummaryDto>.Success(_mapper.Map<ProductSummaryDto>(product));
    }
}
