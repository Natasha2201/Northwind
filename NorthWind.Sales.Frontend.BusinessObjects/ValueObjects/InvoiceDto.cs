namespace NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

public class InvoiceDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerIdentification { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;
    public string ShipAddress { get; set; } = string.Empty;
    public string ShipCity { get; set; } = string.Empty;
    public string ShipCountry { get; set; } = string.Empty;
    public string ShipPostalCode { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Tax { get; set; }
    public decimal Total { get; set; }
    public IEnumerable<InvoiceDetailDto> Details { get; set; } = [];

    public InvoiceDto() { }

    public InvoiceDto(
        int id,
        string invoiceNumber,
        DateTime orderDate,
        string customerId,
        string customerName,
        string customerIdentification,
        string customerAddress,
        string shipAddress,
        string shipCity,
        string shipCountry,
        string shipPostalCode,
        decimal subtotal,
        decimal tax,
        decimal total,
        IEnumerable<InvoiceDetailDto> details)
    {
        Id = id;
        InvoiceNumber = invoiceNumber;
        OrderDate = orderDate;
        CustomerId = customerId;
        CustomerName = customerName;
        CustomerIdentification = customerIdentification;
        CustomerAddress = customerAddress;
        ShipAddress = shipAddress;
        ShipCity = shipCity;
        ShipCountry = shipCountry;
        ShipPostalCode = shipPostalCode;
        Subtotal = subtotal;
        Tax = tax;
        Total = total;
        Details = details;
    }
}

public class InvoiceDetailDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public decimal UnitPrice { get; set; }
    public short Quantity { get; set; }
    public decimal Subtotal => UnitPrice * Quantity;

    public InvoiceDetailDto() { }

    public InvoiceDetailDto(int productId, string productName, decimal unitPrice, short quantity)
    {
        ProductId = productId;
        ProductName = productName;
        UnitPrice = unitPrice;
        Quantity = quantity;
    }
}
