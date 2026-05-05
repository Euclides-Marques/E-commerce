using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductReview : AuditableEntity
{
    public Guid ProductId { get; set; }
    public Guid UserId { get; set; }
    public int Rating { get; set; }
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsVerifiedPurchase { get; set; } = false;
    public bool IsApproved { get; set; } = true;
    public int HelpfulCount { get; set; } = 0;

    public Product Product { get; set; } = null!;
    public User User { get; set; } = null!;
}