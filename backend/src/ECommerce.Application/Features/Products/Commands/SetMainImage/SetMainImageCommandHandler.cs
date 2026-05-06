using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Products.Commands.SetMainImage;

public class SetMainImageCommandHandler : IRequestHandler<SetMainImageCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public SetMainImageCommandHandler(IApplicationDbContext context)
    {
        _context = context;
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
        return Result.Success();
    }
}
