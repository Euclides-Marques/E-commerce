using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Reviews.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Reviews.Commands.CreateProductReview;

public record CreateProductReviewCommand(
    Guid ProductId,
    int Rating,
    string? Title,
    string? Comment
) : IRequest<Result<ReviewDto>>;
