using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Reviews.DTOs;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Reviews.Commands.CreateProductReview;

public class CreateProductReviewCommandHandler : IRequestHandler<CreateProductReviewCommand, Result<ReviewDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly ICurrentUser _currentUser;

    public CreateProductReviewCommandHandler(IApplicationDbContext context, ICurrentUser currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    public async Task<Result<ReviewDto>> Handle(CreateProductReviewCommand request, CancellationToken cancellationToken)
    {
        if (_currentUser.UserId is null)
            return Result<ReviewDto>.Failure("Usuário não autenticado.");

        var product = await _context.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, cancellationToken);
        if (product is null)
            return Result<ReviewDto>.Failure("Produto não encontrado.");

        var alreadyReviewed = await _context.ProductReviews
            .AnyAsync(r => r.ProductId == request.ProductId && r.UserId == _currentUser.UserId.Value && !r.IsDeleted, cancellationToken);
        if (alreadyReviewed)
            return Result<ReviewDto>.Failure("Você já avaliou este produto.");

        var isVerifiedPurchase = await _context.Orders
            .AnyAsync(o => o.UserId == _currentUser.UserId.Value
                && !o.IsDeleted
                && (o.Status == OrderStatus.Paid || o.Status == OrderStatus.Shipped || o.Status == OrderStatus.Delivered)
                && o.Items.Any(i => i.ProductId == request.ProductId), cancellationToken);

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value, cancellationToken);

        var review = new ProductReview
        {
            ProductId = request.ProductId,
            UserId = _currentUser.UserId.Value,
            Rating = request.Rating,
            Title = request.Title,
            Comment = request.Comment,
            IsVerifiedPurchase = isVerifiedPurchase,
            IsApproved = true,
        };

        await _context.ProductReviews.AddAsync(review, cancellationToken);

        var allRatings = await _context.ProductReviews
            .Where(r => r.ProductId == request.ProductId && !r.IsDeleted)
            .Select(r => r.Rating)
            .ToListAsync(cancellationToken);

        allRatings.Add(request.Rating);
        product.ReviewCount = allRatings.Count;
        product.AverageRating = Math.Round(allRatings.Average(), 1);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<ReviewDto>.Success(new ReviewDto(
            review.Id,
            review.ProductId,
            review.UserId,
            $"{user?.FirstName} {user?.LastName}".Trim(),
            review.Rating,
            review.Title,
            review.Comment,
            review.IsVerifiedPurchase,
            review.HelpfulCount,
            review.CreatedAt
        ));
    }
}
