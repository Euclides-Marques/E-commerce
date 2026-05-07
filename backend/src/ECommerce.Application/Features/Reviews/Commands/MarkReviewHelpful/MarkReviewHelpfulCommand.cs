using ECommerce.Application.Common.Models;
using MediatR;

namespace ECommerce.Application.Features.Reviews.Commands.MarkReviewHelpful;

public record MarkReviewHelpfulCommand(Guid ReviewId) : IRequest<Result>;
