namespace NorthWind.Sales.Backend.BusinessObjects.ValueObjects;

public class InvoiceDto(
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
    public int Id => id;
    public string InvoiceNumber => invoiceNumber;
    public DateTime OrderDate => orderDate;
    public string CustomerId => customerId;
    public string CustomerName => customerName;
    public string CustomerIdentification => customerIdentification;
    public string CustomerAddress => customerAddress;
    public string ShipAddress => shipAddress;
    public string ShipCity => shipCity;
    public string ShipCountry => shipCountry;
    public string ShipPostalCode => shipPostalCode;
    public decimal Subtotal => subtotal;
    public decimal Tax => tax;
    public decimal Total => total;
    public IEnumerable<InvoiceDetailDto> Details => details;
}

public class InvoiceDetailDto(
    int productId,
    string productName,
    decimal unitPrice,
    short quantity)
{
    public int ProductId => productId;
    public string ProductName => productName;
    public decimal UnitPrice => unitPrice;
    public short Quantity => quantity;
    public decimal Subtotal => unitPrice * quantity;
}
