using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Categories.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Categories.Commands.UpdateCategory;

public record UpdateCategoryCommand(
    Guid Id,
    string Name,
    string? Description,
    string? ImageUrl,
    string? IconUrl,
    Guid? ParentId,
    int DisplayOrder,
    bool IsActive
) : IRequest<Result<CategoryDto>>;
