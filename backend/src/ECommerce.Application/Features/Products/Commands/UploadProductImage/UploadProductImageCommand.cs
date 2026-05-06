using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Products.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Products.Commands.UploadProductImage;

public record UploadProductImageCommand(
    Guid ProductId,
    Stream FileStream,
    string FileName,
    string? AltText,
    bool SetAsMain
) : IRequest<Result<ProductImageDto>>;
