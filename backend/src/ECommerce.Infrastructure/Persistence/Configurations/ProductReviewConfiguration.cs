using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class ProductReviewConfiguration : IEntityTypeConfiguration<ProductReview>
{
    public void Configure(EntityTypeBuilder<ProductReview> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Title).HasMaxLength(150);
        builder.Property(r => r.Comment).HasMaxLength(2000);
        builder.Property(r => r.Rating).IsRequired();
        builder.HasIndex(r => new { r.UserId, r.ProductId }).IsUnique();
        builder.HasOne(r => r.Product).WithMany(p => p.Reviews).HasForeignKey(r => r.ProductId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(r => r.User).WithMany(u => u.Reviews).HasForeignKey(r => r.UserId).OnDelete(DeleteBehavior.Cascade);
    }
}
