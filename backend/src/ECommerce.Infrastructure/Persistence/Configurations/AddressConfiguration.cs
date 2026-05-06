using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Persistence.Configurations;

public class AddressConfiguration : IEntityTypeConfiguration<Address>
{
    public void Configure(EntityTypeBuilder<Address> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Label).HasMaxLength(50).IsRequired();
        builder.Property(a => a.Recipient).HasMaxLength(150).IsRequired();
        builder.Property(a => a.ZipCode).HasMaxLength(10).IsRequired();
        builder.Property(a => a.Street).HasMaxLength(200).IsRequired();
        builder.Property(a => a.Number).HasMaxLength(20).IsRequired();
        builder.Property(a => a.Complement).HasMaxLength(100);
        builder.Property(a => a.Neighborhood).HasMaxLength(100).IsRequired();
        builder.Property(a => a.City).HasMaxLength(100).IsRequired();
        builder.Property(a => a.State).HasMaxLength(2).IsRequired();
        builder.Property(a => a.Country).HasMaxLength(50).HasDefaultValue("Brasil");
    }
}
