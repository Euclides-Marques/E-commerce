using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Categories.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Categories.Queries.GetCategoriesHierarchy;

public record GetCategoriesHierarchyQuery(bool? IsActive = null) : IRequest<Result<List<CategoryDto>>>;
