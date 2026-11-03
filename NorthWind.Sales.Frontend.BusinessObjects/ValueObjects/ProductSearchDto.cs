namespace NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

public class ProductSearchDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public short UnitsInStock { get; set; }

    public ProductSearchDto() { }

    public ProductSearchDto(
        int id,
        string name,
        decimal unitPrice,
        short unitsInStock)
    {
        Id = id;
        Name = name;
        UnitPrice = unitPrice;
        UnitsInStock = unitsInStock;
    }
}
