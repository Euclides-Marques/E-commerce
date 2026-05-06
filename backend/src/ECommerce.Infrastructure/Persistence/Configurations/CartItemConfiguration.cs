using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class CartItemConfiguration : IEntityTypeConfiguration<CartItem>
{
    public void Configure(EntityTypeBuilder<CartItem> builder)
    {
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Quantity).IsRequired();
        builder.HasIndex(c => new { c.UserId, c.ProductId }).IsUnique();
        builder.HasOne(c => c.User).WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
        builder.HasOne(c => c.Product).WithMany(p => p.CartItems).HasForeignKey(c => c.ProductId).OnDelete(DeleteBehavior.Cascade);
    }
}
