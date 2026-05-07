using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Reviews.DTOs;
using MediatR;

namespace ECommerce.Application.Features.Reviews.Queries.GetProductReviews;

public record GetProductReviewsQuery(Guid ProductId, int Page = 1, int PageSize = 10) : IRequest<Result<ReviewSummaryDto>>;
