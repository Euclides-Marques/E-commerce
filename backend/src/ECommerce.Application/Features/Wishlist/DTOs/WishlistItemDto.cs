namespace ECommerce.Application.Features.Wishlist.DTOs;

public record WishlistItemDto(
    Guid ProductId,
    string ProductName,
    string ProductSlug,
    decimal Price,
    decimal? OriginalPrice,
    string? ImageUrl,
    double AverageRating,
    int ReviewCount,
    bool InStock,
    DateTime AddedAt
);

public record ToggleWishlistResult(bool IsInWishlist);
