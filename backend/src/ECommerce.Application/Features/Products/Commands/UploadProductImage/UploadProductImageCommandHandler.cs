using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using ECommerce.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Commands.UploadProductImage;

public class UploadProductImageCommandHandler : IRequestHandler<UploadProductImageCommand, Result<ProductImageDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileUploadService _fileUploadService;
    private readonly ICacheService _cache;

    public UploadProductImageCommandHandler(IApplicationDbContext context, IFileUploadService fileUploadService, ICacheService cache)
    {
        _context = context;
        _fileUploadService = fileUploadService;
        _cache = cache;
    }

    public async Task<Result<ProductImageDto>> Handle(UploadProductImageCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        if (product is null)
            return Result<ProductImageDto>.Failure("Produto não encontrado.");

        var (url, publicId) = await _fileUploadService.UploadAsync(
            request.FileStream,
            request.FileName,
            $"products/{request.ProductId}",
            cancellationToken);

        if (request.SetAsMain)
        {
            foreach (var img in product.Images.Where(i => i.IsMain))
                img.IsMain = false;
        }

        var isFirst = !product.Images.Any();
        var displayOrder = product.Images.Any() ? product.Images.Max(i => i.DisplayOrder) + 1 : 0;

        var image = new ProductImage
        {
            ProductId = request.ProductId,
            Url = url,
            PublicId = publicId,
            AltText = request.AltText,
            IsMain = request.SetAsMain || isFirst,
            DisplayOrder = displayOrder,
        };

        _context.ProductImages.Add(image);
        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveAsync($"products:id:{product.Id}", cancellationToken);
        await _cache.RemoveAsync($"products:slug:{product.Slug}", cancellationToken);

        return Result<ProductImageDto>.Success(
            new ProductImageDto(image.Id, image.Url, image.AltText, image.IsMain, image.DisplayOrder));
    }
}
