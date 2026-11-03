namespace NorthWind.Sales.Backend.DataContexts.EFCore.Configurations;

internal class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .IsRequired()
            .HasMaxLength(5)
            .IsFixedLength();

        builder.Property(c => c.Identification)
            .IsRequired()
            .HasMaxLength(13)
            .IsFixedLength();

        builder.Property(c => c.FirstName)
            .IsRequired()
            .HasMaxLength(60);

        builder.Property(c => c.LastName)
            .IsRequired()
            .HasMaxLength(60);

        builder.Property(c => c.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Phone)
            .HasMaxLength(20);

        builder.Property(c => c.Address)
            .HasMaxLength(200);

        builder.Property(c => c.CurrentBalance)
            .HasPrecision(12, 2);

        // Datos de prueba actualizados
        builder.HasData(
            new Customer
            {
                Id = "ALFKI",
                Identification = "1712345678",
                FirstName = "Alfreds",
                LastName = "Futterkiste",
                Email = "alfreds@northwind.com",
                Phone = "0991234567",
                Address = "Av. Amazonas 123",
                CurrentBalance = 0
            },
            new Customer
            {
                Id = "ANTON",
                Identification = "1798765432",
                FirstName = "Antonio",
                LastName = "Moreno",
                Email = "antonio@northwind.com",
                Phone = "0997654321",
                Address = "Calle 10 de Agosto 456",
                CurrentBalance = 100
            },
            new Customer
            {
                Id = "BOLID",
                Identification = "1755555555",
                FirstName = "Bolido",
                LastName = "Comidas",
                Email = "bolido@northwind.com",
                Phone = "0995555555",
                Address = "Av. 6 de Diciembre 789",
                CurrentBalance = 0
            },
            new Customer
            {
                Id = "FAMIA",
                Identification = "1744444444",
                FirstName = "Familia",
                LastName = "Arquibaldo",
                Email = "familia@northwind.com",
                Phone = "0994444444",
                Address = "Av. Eloy Alfaro 321",
                CurrentBalance = 0
            }
        );
    }
}