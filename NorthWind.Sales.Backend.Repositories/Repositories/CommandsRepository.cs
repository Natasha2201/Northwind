namespace NorthWind.Sales.Backend.Repositories.Repositories;

internal class CommandsRepository(INorthWindSalesCommandsDataContext context) :
    ICommandsRepository
{
    private (OrderAggregate DomainOrder, Entities.Order PersistenceOrder)? lastCreatedOrder;

    public async Task CreateOrder(OrderAggregate order)
    {
        string customerId = order.CustomerId;
        if (customerId.Length != 5)
        {
            var resolvedId = await context.FindCustomerIdByIdentificationAsync(customerId);
            if (!string.IsNullOrEmpty(resolvedId))
            {
                customerId = resolvedId;
            }
        }

        Entities.Order orderEntity = new Entities.Order
        {
            CustomerId = customerId,
            ShipAddress = order.ShipAddress,
            ShipCity = order.ShipCity,
            ShipCountry = order.ShipCountry,
            ShipPostalCode = order.ShipPostalCode,
            InvoiceNumber = order.InvoiceNumber ?? string.Empty,
            Subtotal = order.Subtotal,
            Tax = order.Tax,
            Total = order.Total,
            OrderDate = order.OrderDate
        };
        lastCreatedOrder = (order, orderEntity);

        await context.AddOrderAsync(orderEntity);
        await context.AddOrderDetailsAsync(
            order.OrderDetails
            .Select(d => new Entities.OrderDetail
            {
                Order = orderEntity,
                ProductId = d.ProductId,
                Quantity = d.Quantity,
                UnitPrice = d.UnitPrice
            }).ToArray());
    }

    public async Task UpdateOrderTotals(OrderAggregate order)
    {
        var orderEntity = await context.FindOrderAsync(order.Id);
        if (orderEntity != null)
        {
            orderEntity.InvoiceNumber = order.InvoiceNumber;
            orderEntity.Subtotal = order.Subtotal;
            orderEntity.Tax = order.Tax;
            orderEntity.Total = order.Total;
        }
    }

    public async Task DecreaseStockAsync(OrderAggregate order)
    {
        foreach (var detail in order.OrderDetails)
        {
            var product = await context.FindProductAsync(detail.ProductId);
            if (product != null)
            {
                product.UnitsInStock -= detail.Quantity;
            }
        }
    }

    public async Task SaveChanges()
    {
        await context.SaveChangesAsync();
        if (lastCreatedOrder.HasValue)
        {
            lastCreatedOrder.Value.DomainOrder.Id = lastCreatedOrder.Value.PersistenceOrder.Id;
            lastCreatedOrder = null;
        }
    }
}
