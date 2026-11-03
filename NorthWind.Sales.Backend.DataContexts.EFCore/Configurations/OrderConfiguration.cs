using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using NorthWind.Sales.Backend.Repositories.Entities;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Configurations;

internal class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.Property(o => o.CustomerId).IsRequired().HasMaxLength(5).IsFixedLength();
        builder.Property(o => o.ShipAddress).IsRequired().HasMaxLength(60);
        builder.Property(o => o.ShipCity).HasMaxLength(15);
        builder.Property(o => o.ShipCountry).HasMaxLength(15);
        builder.Property(o => o.ShipPostalCode).HasMaxLength(10);
        builder.Property(o => o.InvoiceNumber).IsRequired().HasMaxLength(20);
        builder.Property(o => o.Subtotal).HasPrecision(12, 2);
        builder.Property(o => o.Tax).HasPrecision(12, 2);
        builder.Property(o => o.Total).HasPrecision(12, 2);
        builder.HasOne<Customer>().WithMany().HasForeignKey(o => o.CustomerId);
    }
}
