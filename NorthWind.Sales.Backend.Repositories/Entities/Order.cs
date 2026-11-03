namespace NorthWind.Sales.Backend.Repositories.Entities;

public class Order
{
    public int Id { get; set; }
    public string CustomerId { get; set; } = null!;
    public string ShipAddress { get; set; } = null!;
    public string ShipCity { get; set; } = null!;
    public string ShipCountry { get; set; } = null!;
    public string ShipPostalCode { get; set; } = null!;
    public string InvoiceNumber { get; set; } = null!;
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public DateTime OrderDate { get; set; }
}
