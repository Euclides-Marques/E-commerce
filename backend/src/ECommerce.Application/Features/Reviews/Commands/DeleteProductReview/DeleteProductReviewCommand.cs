using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Reviews.Commands.DeleteProductReview;

public record DeleteProductReviewCommand(Guid ReviewId) : IRequest<Result>;
