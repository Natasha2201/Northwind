
namespace NorthWind.Sales.Backend.DataContexts.EFCore.Configurations;
internal class OrderDetailConfiguration : IEntityTypeConfiguration<NorthWind.Sales.Backend.Repositories.Entities.OrderDetail>
{
    public void Configure(EntityTypeBuilder<NorthWind.Sales.Backend.Repositories.Entities.OrderDetail> builder)
    {
        builder.HasKey(d => new { d.OrderId, d.ProductId });
        builder.Property(d => d.UnitPrice)
            .HasPrecision(8, 2);

        builder.HasOne<Product>()
            .WithMany()
            .HasForeignKey(p => p.ProductId);
    }
}
