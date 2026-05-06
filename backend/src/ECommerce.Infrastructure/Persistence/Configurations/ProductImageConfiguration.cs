using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class ProductImageConfiguration : IEntityTypeConfiguration<ProductImage>
{
    public void Configure(EntityTypeBuilder<ProductImage> builder)
    {
        builder.HasKey(i => i.Id);
        builder.Property(i => i.Url).HasMaxLength(500).IsRequired();
        builder.Property(i => i.PublicId).HasMaxLength(200);
        builder.Property(i => i.AltText).HasMaxLength(200);
        builder.HasIndex(i => i.ProductId);
        builder.HasIndex(i => new { i.ProductId, i.IsMain });
    }
}
