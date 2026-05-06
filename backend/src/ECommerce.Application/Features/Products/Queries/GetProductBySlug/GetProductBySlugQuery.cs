using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Queries.GetProductBySlug;

public record GetProductBySlugQuery(string Slug) : IRequest<Result<ProductDto>>;
