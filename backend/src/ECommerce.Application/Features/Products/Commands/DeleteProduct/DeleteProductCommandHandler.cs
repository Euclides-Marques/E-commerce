using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Commands.DeleteProduct;

public class DeleteProductCommandHandler : IRequestHandler<DeleteProductCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileUploadService _fileUploadService;
    private readonly ICacheService _cache;

    public DeleteProductCommandHandler(IApplicationDbContext context, IFileUploadService fileUploadService, ICacheService cache)
    {
        _context = context;
        _fileUploadService = fileUploadService;
        _cache = cache;
    }

    public async Task<Result> Handle(DeleteProductCommand request, CancellationToken cancellationToken)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (product is null)
            return Result.Failure("Produto não encontrado.");

        var slug = product.Slug;

        foreach (var image in product.Images.Where(i => !string.IsNullOrEmpty(i.PublicId)))
        {
            try { await _fileUploadService.DeleteAsync(image.PublicId!, cancellationToken); }
            catch { /* best-effort */ }
        }

        _context.Products.Remove(product);
        await _context.SaveChangesAsync(cancellationToken);

        await _cache.RemoveAsync($"products:id:{request.Id}", cancellationToken);
        await _cache.RemoveAsync($"products:slug:{slug}", cancellationToken);

        return Result.Success();
    }
}
