using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ECommerce.Application.Features.Products.Commands.UpdateProduct;

public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, Result<ProductDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateProductCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<ProductDto>> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product is null)
            return Result<ProductDto>.Failure("Produto não encontrado.");

        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (!categoryExists)
            return Result<ProductDto>.Failure("Categoria não encontrada.");

        var skuExists = await _context.Products
            .AnyAsync(p => p.SKU == request.SKU && p.Id != request.Id, cancellationToken);

        if (skuExists)
            return Result<ProductDto>.Failure("Já existe um produto com este SKU.");

        if (!product.Name.Equals(request.Name, StringComparison.OrdinalIgnoreCase))
        {
            var newSlug = GenerateSlug(request.Name);
            var slugExists = await _context.Products
                .AnyAsync(p => p.Slug == newSlug && p.Id != request.Id, cancellationToken);
            product.Slug = slugExists ? $"{newSlug}-{Guid.NewGuid().ToString()[..8]}" : newSlug;
        }

        product.Name = request.Name;
        product.Description = request.Description;
        product.ShortDescription = request.ShortDescription;
        product.SKU = request.SKU;
        product.Price = request.Price;
        product.OriginalPrice = request.OriginalPrice;
        product.StockQuantity = request.StockQuantity;
        product.CategoryId = request.CategoryId;
        product.IsActive = request.IsActive;
        product.IsFeatured = request.IsFeatured;
        product.Weight = request.Weight;

        await _context.SaveChangesAsync(cancellationToken);

        var updated = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstAsync(p => p.Id == product.Id, cancellationToken);

        return Result<ProductDto>.Success(_mapper.Map<ProductDto>(updated));
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant();
        slug = Regex.Replace(slug, @"[àáâãä]", "a");
        slug = Regex.Replace(slug, @"[èéêë]", "e");
        slug = Regex.Replace(slug, @"[ìíîï]", "i");
        slug = Regex.Replace(slug, @"[òóôõö]", "o");
        slug = Regex.Replace(slug, @"[ùúûü]", "u");
        slug = Regex.Replace(slug, @"[ç]", "c");
        slug = Regex.Replace(slug, @"[ñ]", "n");
        slug = Regex.Replace(slug, @"[^a-z0-9\s-]", "");
        slug = Regex.Replace(slug, @"\s+", "-");
        slug = Regex.Replace(slug, @"-+", "-").Trim('-');
        return slug;
    }
}
