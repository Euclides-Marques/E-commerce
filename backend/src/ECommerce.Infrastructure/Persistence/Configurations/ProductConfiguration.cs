using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(300).IsRequired();
        builder.Property(p => p.Slug).HasMaxLength(300).IsRequired();
        builder.HasIndex(p => p.Slug).IsUnique();
        builder.Property(p => p.SKU).HasMaxLength(100).IsRequired();
        builder.HasIndex(p => p.SKU).IsUnique();
        builder.Property(p => p.Price).HasColumnType("decimal(18,2)").IsRequired();
        builder.Property(p => p.OriginalPrice).HasColumnType("decimal(18,2)");
        builder.Property(p => p.DiscountPercent).HasColumnType("decimal(5,2)");
        builder.Property(p => p.Weight).HasColumnType("decimal(10,3)");
        builder.Property(p => p.Width).HasColumnType("decimal(10,2)");
        builder.Property(p => p.Height).HasColumnType("decimal(10,2)");
        builder.Property(p => p.Length).HasColumnType("decimal(10,2)");

        builder.HasMany(p => p.Images).WithOne(i => i.Product).HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(p => p.Variants).WithOne(v => v.Product).HasForeignKey(v => v.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(p => p.Reviews).WithOne(r => r.Product).HasForeignKey(r => r.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}