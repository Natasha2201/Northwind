namespace NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

public class InvoiceSearchDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerFirstName { get; set; } = string.Empty;
    public string CustomerLastName { get; set; } = string.Empty;
    public string CustomerIdentification { get; set; } = string.Empty;
    public decimal Total { get; set; }

    public InvoiceSearchDto() { }

    public InvoiceSearchDto(
        int id,
        string invoiceNumber,
        DateTime orderDate,
        string customerId,
        string customerFirstName,
        string customerLastName,
        string customerIdentification,
        decimal total)
    {
        Id = id;
        InvoiceNumber = invoiceNumber;
        OrderDate = orderDate;
        CustomerId = customerId;
        CustomerFirstName = customerFirstName;
        CustomerLastName = customerLastName;
        CustomerIdentification = customerIdentification;
        Total = total;
    }
}
