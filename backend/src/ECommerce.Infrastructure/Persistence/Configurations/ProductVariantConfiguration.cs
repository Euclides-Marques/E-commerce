using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class ProductVariantConfiguration : IEntityTypeConfiguration<ProductVariant>
{
    public void Configure(EntityTypeBuilder<ProductVariant> builder)
    {
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Name).HasMaxLength(100).IsRequired();
        builder.Property(v => v.Value).HasMaxLength(100).IsRequired();
        builder.Property(v => v.SKU).HasMaxLength(100);
        builder.Property(v => v.PriceAdjustment).HasColumnType("decimal(18,2)");
        builder.Property(v => v.ImageUrl).HasMaxLength(500);
        builder.HasIndex(v => v.ProductId);
    }
}
