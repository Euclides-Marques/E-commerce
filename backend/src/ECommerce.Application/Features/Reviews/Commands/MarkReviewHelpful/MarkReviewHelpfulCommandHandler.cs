using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Reviews.Commands.MarkReviewHelpful;

public class MarkReviewHelpfulCommandHandler : IRequestHandler<MarkReviewHelpfulCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public MarkReviewHelpfulCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(MarkReviewHelpfulCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result.Failure("Usuário não autenticado.");

        var review = await _context.ProductReviews
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId && !r.IsDeleted, cancellationToken);

        if (review is null)
            return Result.Failure("Avaliação não encontrada.");

        review.HelpfulCount++;
        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
