using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Commands.SetMainImage;

public class SetMainImageCommandHandler : IRequestHandler<SetMainImageCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICacheService _cache;

    public SetMainImageCommandHandler(IApplicationDbContext context, ICacheService cache)
    {
        _context = context;
        _cache = cache;
    }

    public async Task<Result> Handle(SetMainImageCommand request, CancellationToken cancellationToken)
    {
        var images = await _context.ProductImages
            .Where(i => i.ProductId == request.ProductId)
            .ToListAsync(cancellationToken);

        var target = images.FirstOrDefault(i => i.Id == request.ImageId);

        if (target is null)
            return Result.Failure("Imagem não encontrada.");

        foreach (var img in images)
            img.IsMain = img.Id == request.ImageId;

        await _context.SaveChangesAsync(cancellationToken);

        var product = await _context.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);

        await _cache.RemoveAsync($"products:id:{request.ProductId}", cancellationToken);
        if (product is not null)
            await _cache.RemoveAsync($"products:slug:{product.Slug}", cancellationToken);

        return Result.Success();
    }
}
