using ECommerce.Application.Common.Interfaces;
using ECommerce.Application.Common.Models;
using ECommerce.Application.Features.Reviews.DTOs;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Features.Reviews.Queries.GetProductReviews;

public class GetProductReviewsQueryHandler : IRequestHandler<GetProductReviewsQuery, Result<ReviewSummaryDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductReviewsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result<ReviewSummaryDto>> Handle(GetProductReviewsQuery request, CancellationToken cancellationToken)
    {
        var baseQuery = _context.ProductReviews
            .Where(r => r.ProductId == request.ProductId && !r.IsDeleted && r.IsApproved)
            .AsNoTracking();

        var totalCount = await baseQuery.CountAsync(cancellationToken);

        var allRatings = await baseQuery
            .Select(r => r.Rating)
            .ToListAsync(cancellationToken);

        var starCounts = new int[5];
        foreach (var rating in allRatings)
            if (rating >= 1 && rating <= 5)
                starCounts[rating - 1]++;

        var averageRating = totalCount > 0 ? Math.Round(allRatings.Average(), 1) : 0.0;
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var items = await baseQuery
            .Include(r => r.User)
            .OrderByDescending(r => r.HelpfulCount)
            .ThenByDescending(r => r.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new ReviewDto(
                r.Id,
                r.ProductId,
                r.UserId,
                r.User.FirstName + " " + r.User.LastName,
                r.Rating,
                r.Title,
                r.Comment,
                r.IsVerifiedPurchase,
                r.HelpfulCount,
                r.CreatedAt
            ))
            .ToListAsync(cancellationToken);

        return Result<ReviewSummaryDto>.Success(new ReviewSummaryDto(
            averageRating,
            totalCount,
            starCounts,
            items,
            request.Page,
            request.PageSize,
            totalPages
        ));
    }
}
