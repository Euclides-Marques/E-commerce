using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Commands.DeleteProductImage;

public class DeleteProductImageCommandHandler : IRequestHandler<DeleteProductImageCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileUploadService _fileUploadService;
    private readonly ICacheService _cache;

    public DeleteProductImageCommandHandler(IApplicationDbContext context, IFileUploadService fileUploadService, ICacheService cache)
    {
        _context = context;
        _fileUploadService = fileUploadService;
        _cache = cache;
    }

    public async Task<Result> Handle(DeleteProductImageCommand request, CancellationToken cancellationToken)
    {
        var image = await _context.ProductImages
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == request.ImageId, cancellationToken);

        if (image is null)
            return Result.Failure("Imagem não encontrada.");

        if (!string.IsNullOrEmpty(image.PublicId))
        {
            try { await _fileUploadService.DeleteAsync(image.PublicId, cancellationToken); }
            catch { /* best-effort */ }
        }

        var wasMain = image.IsMain;
        var productId = image.ProductId;
        var productSlug = image.Product.Slug;

        _context.ProductImages.Remove(image);
        await _context.SaveChangesAsync(cancellationToken);

        if (wasMain)
        {
            var nextImage = await _context.ProductImages
                .Where(i => i.ProductId == productId)
                .OrderBy(i => i.DisplayOrder)
                .FirstOrDefaultAsync(cancellationToken);

            if (nextImage is not null)
            {
                nextImage.IsMain = true;
                await _context.SaveChangesAsync(cancellationToken);
            }
        }

        await _cache.RemoveAsync($"products:id:{productId}", cancellationToken);
        await _cache.RemoveAsync($"products:slug:{productSlug}", cancellationToken);

        return Result.Success();
    }
}
