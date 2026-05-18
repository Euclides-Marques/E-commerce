using AutoMapper;
using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Categories.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Categories.Commands.UploadCategoryImage;

public class UploadCategoryImageCommandHandler : IRequestHandler<UploadCategoryImageCommand, Result<CategoryDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IFileUploadService _fileUploadService;
    private readonly IMapper _mapper;

    public UploadCategoryImageCommandHandler(
        IApplicationDbContext context,
        IFileUploadService fileUploadService,
        IMapper mapper)
    {
        _context = context;
        _fileUploadService = fileUploadService;
        _mapper = mapper;
    }

    public async Task<Result<CategoryDto>> Handle(UploadCategoryImageCommand request, CancellationToken cancellationToken)
    {
        var category = await _context.Categories
            .Include(c => c.Children)
            .FirstOrDefaultAsync(c => c.Id == request.CategoryId, cancellationToken);

        if (category is null)
            return Result<CategoryDto>.Failure("Categoria não encontrada.");

        var (url, _) = await _fileUploadService.UploadAsync(
            request.FileStream,
            request.FileName,
            $"categories/{request.CategoryId}",
            cancellationToken);

        category.ImageUrl = url;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<CategoryDto>.Success(_mapper.Map<CategoryDto>(category));
    }
}
