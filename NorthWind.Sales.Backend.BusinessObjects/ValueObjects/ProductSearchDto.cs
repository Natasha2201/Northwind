namespace NorthWind.Sales.Backend.BusinessObjects.ValueObjects;

public class ProductSearchDto(
    int id,
    string name,
    decimal unitPrice,
    short unitsInStock)
{
    public int Id => id;
    public string Name => name;
    public decimal UnitPrice => unitPrice;
    public short UnitsInStock => unitsInStock;
}
