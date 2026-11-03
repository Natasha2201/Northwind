namespace NorthWind.Sales.Backend.BusinessObjects.POCOEntities;

public class Customer
{
    public string Id { get; set; } = null!;
    public string Identification { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Phone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public decimal CurrentBalance { get; set; }
}
