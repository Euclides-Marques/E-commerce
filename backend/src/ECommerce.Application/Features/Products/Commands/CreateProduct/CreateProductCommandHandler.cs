using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ECommerce.Application.Features.Products.Commands.CreateProduct;

public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, Result<ProductDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CreateProductCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<ProductDto>> Handle(CreateProductCommand request, CancellationToken cancellationToken)
    {
        var categoryExists = await _context.Categories
            .AnyAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (!categoryExists)
            return Result<ProductDto>.Failure("Categoria não encontrada.");

        var skuExists = await _context.Products
            .AnyAsync(p => p.SKU == request.SKU, cancellationToken);

        if (skuExists)
            return Result<ProductDto>.Failure("Já existe um produto com este SKU.");

        var slug = GenerateSlug(request.Name);
        var slugExists = await _context.Products.AnyAsync(p => p.Slug == slug, cancellationToken);
        if (slugExists)
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";

        var product = new Product
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            ShortDescription = request.ShortDescription,
            SKU = request.SKU,
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            StockQuantity = request.StockQuantity,
            CategoryId = request.CategoryId,
            IsActive = request.IsActive,
            IsFeatured = request.IsFeatured,
            Weight = request.Weight,
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);

        var created = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .FirstAsync(p => p.Id == product.Id, cancellationToken);

        return Result<ProductDto>.Success(_mapper.Map<ProductDto>(created));
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
