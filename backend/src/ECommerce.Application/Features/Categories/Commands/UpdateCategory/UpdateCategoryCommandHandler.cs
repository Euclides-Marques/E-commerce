using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Categories.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Categories.Commands.UpdateCategory;

public class UpdateCategoryCommandHandler : IRequestHandler<UpdateCategoryCommand, Result<CategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public UpdateCategoryCommandHandler(IApplicationDbContext context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<Result<CategoryDto>> Handle(UpdateCategoryCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (category is null)
            return Result<CategoryDto>.Failure("Categoria não encontrada.");

        if (request.ParentId.HasValue)
        {
            if (request.ParentId.Value == request.Id)
                return Result<CategoryDto>.Failure("Uma categoria não pode ser filha de si mesma.");

            var parentExists = await _context.Categories
                .AnyAsync(c => c.Id == request.ParentId.Value, cancellationToken);

            if (!parentExists)
                return Result<CategoryDto>.Failure("Categoria pai não encontrada.");
        }

        category.Name = request.Name;
        category.Description = request.Description;
        category.ImageUrl = request.ImageUrl;
        category.IconUrl = request.IconUrl;
        category.ParentId = request.ParentId;
        category.DisplayOrder = request.DisplayOrder;
        category.IsActive = request.IsActive;
        category.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        var updated = await _context.Categories
            .Include(c => c.Children)
            .FirstAsync(c => c.Id == category.Id, cancellationToken);

        return Result<CategoryDto>.Success(_mapper.Map<CategoryDto>(updated));
    }
}
