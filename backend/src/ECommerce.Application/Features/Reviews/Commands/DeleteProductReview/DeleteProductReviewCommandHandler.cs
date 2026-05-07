using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Reviews.Commands.DeleteProductReview;

public class DeleteProductReviewCommandHandler : IRequestHandler<DeleteProductReviewCommand, Result>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public DeleteProductReviewCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result> Handle(DeleteProductReviewCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result.Failure("Usuário não autenticado.");

        var review = await _context.ProductReviews
            .Include(r => r.Product)
            .FirstOrDefaultAsync(r => r.Id == request.ReviewId && !r.IsDeleted, cancellationToken);

        if (review is null)
            return Result.Failure("Avaliação não encontrada.");

        var isAdmin = await _context.Users
            .AnyAsync(u => u.Id == _currentUser.UserId.Value && u.Role == ECommerce.Domain.Enums.UserRole.Admin, cancellationToken);

        if (review.UserId != _currentUser.UserId.Value && !isAdmin)
            return Result.Failure("Sem permissão para excluir esta avaliação.");

        review.IsDeleted = true;
        review.DeletedAt = DateTime.UtcNow;

        var product = review.Product;
        var remaining = await _context.ProductReviews
            .Where(r => r.ProductId == product.Id && !r.IsDeleted && r.Id != review.Id)
            .Select(r => r.Rating)
            .ToListAsync(cancellationToken);

        product.ReviewCount = remaining.Count;
        product.AverageRating = remaining.Count > 0 ? Math.Round(remaining.Average(), 1) : 0;

        await _context.SaveChangesAsync(cancellationToken);
        return Result.Success();
    }
}
