using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ProductImage : BaseEntity
{
    public Guid ProductId { get; set; }
    public string Url { get; set; } = string.Empty;
    public string? PublicId { get; set; }
    public string? AltText { get; set; }
    public bool IsMain { get; set; } = false;
    public int DisplayOrder { get; set; } = 0;

    public Product Product { get; set; } = null!;
}