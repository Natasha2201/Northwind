namespace NorthWind.Sales.Backend.BusinessObjects.Aggregates;

public class OrderAggregate : Order
{
    readonly List<OrderDetail> OrderDetailsField = [];
    public IReadOnlyCollection<OrderDetail> OrderDetails =>
        OrderDetailsField;

    public void AddDetail(int productId, decimal unitPrice, short quantity)
    {
        var existingDetail = OrderDetailsField
            .FirstOrDefault(d => d.ProductId == productId);

        if (existingDetail != null)
        {
            // Si el producto ya existe, sumar la cantidad
            quantity += existingDetail.Quantity;
            OrderDetailsField.Remove(existingDetail);
        }

        OrderDetailsField.Add(new OrderDetail(productId, unitPrice, quantity));
        CalculateTotals();
    }

    public void RemoveDetail(int productId)
    {
        var detail = OrderDetailsField.FirstOrDefault(d => d.ProductId == productId);
        if (detail != null)
        {
            OrderDetailsField.Remove(detail);
            CalculateTotals();
        }
    }

    public void UpdateDetail(int productId, short newQuantity)
    {
        var detail = OrderDetailsField.FirstOrDefault(d => d.ProductId == productId);
        if (detail != null)
        {
            if (newQuantity <= 0)
            {
                // Si la nueva cantidad es 0 o menos, eliminar el detalle
                RemoveDetail(productId);
            }
            else
            {
                OrderDetailsField.Remove(detail);
                OrderDetailsField.Add(new OrderDetail(productId, detail.UnitPrice, newQuantity));
                CalculateTotals();
            }
        }
    }

    public void CalculateTotals(decimal taxRate = 0.15m)
    {
        Subtotal = OrderDetailsField.Sum(d => d.UnitPrice * d.Quantity);
        Tax = Math.Round(Subtotal * taxRate, 2);
        Total = Subtotal + Tax;
    }

    public void GenerateInvoiceNumber()
    {
        InvoiceNumber = $"FAC-{Id:D8}";
    }

    public static OrderAggregate From(CreateOrderDto orderDto)
    {
        OrderAggregate OrderAggregate = new OrderAggregate
        {
            CustomerId = orderDto.CustomerId,
            ShipAddress = orderDto.ShipAddress,
            ShipCity = orderDto.ShipCity,
            ShipCountry = orderDto.ShipCountry,
            ShipPostalCode = orderDto.ShipPostalCode
        };
        foreach (var Item in orderDto.OrderDetails)
        {
            OrderAggregate.AddDetail(Item.ProductId,
                Item.UnitPrice, Item.Quantity);
        }
        OrderAggregate.CalculateTotals();
        return OrderAggregate;
    }
}
