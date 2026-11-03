namespace NorthWind.Sales.Backend.BusinessObjects.ValueObjects;

public class InvoiceSearchDto(
    int id,
    string invoiceNumber,
    DateTime orderDate,
    string customerId,
    string customerFirstName,
    string customerLastName,
    string customerIdentification,
    decimal total)
{
    public int Id => id;
    public string InvoiceNumber => invoiceNumber;
    public DateTime OrderDate => orderDate;
    public string CustomerId => customerId;
    public string CustomerFirstName => customerFirstName;
    public string CustomerLastName => customerLastName;
    public string CustomerIdentification => customerIdentification;
    public decimal Total => total;
}
