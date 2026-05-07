using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Categories.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;

namespace ECommerce.Application.Features.Categories.Commands.CreateCategory;

public class CreateCategoryCommandHandler : IRequestHandler<CreateCategoryCommand, Result<CategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly ICacheService _cache;

    public CreateCategoryCommandHandler(IApplicationDbContext context, IMapper mapper, ICacheService cache)
    {
        _context = context;
        _mapper = mapper;
        _cache = cache;
    }

    public async Task<Result<CategoryDto>> Handle(CreateCategoryCommand request, CancellationToken cancellationToken)
    {
        if (request.ParentId.HasValue)
        {
            var parentExists = await _context.Categories
                .AnyAsync(c => c.Id == request.ParentId.Value, cancellationToken);

            if (!parentExists)
                return Result<CategoryDto>.Failure("Categoria pai não encontrada.");
        }

        var slug = GenerateSlug(request.Name);
        var slugExists = await _context.Categories.AnyAsync(c => c.Slug == slug, cancellationToken);
        if (slugExists)
            slug = $"{slug}-{Guid.NewGuid().ToString()[..8]}";

        var category = new Category
        {
            Name = request.Name,
            Slug = slug,
            Description = request.Description,
            ImageUrl = request.ImageUrl,
            IconUrl = request.IconUrl,
            ParentId = request.ParentId,
            DisplayOrder = request.DisplayOrder,
            IsActive = request.IsActive,
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveByPatternAsync("categories:hierarchy:", cancellationToken);

        var created = await _context.Categories
            .Include(c => c.Children)
            .FirstAsync(c => c.Id == category.Id, cancellationToken);

        return Result<CategoryDto>.Success(_mapper.Map<CategoryDto>(created));
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
