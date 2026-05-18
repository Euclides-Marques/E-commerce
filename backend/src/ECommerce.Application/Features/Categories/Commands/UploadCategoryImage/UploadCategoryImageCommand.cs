using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Categories.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Categories.Commands.UploadCategoryImage;

public record UploadCategoryImageCommand(
    Guid CategoryId,
    Stream FileStream,
    string FileName
) : IRequest<Result<CategoryDto>>;
