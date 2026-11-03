namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;

public interface ICommandsRepository : IUnitOfWork
{
    Task CreateOrder(OrderAggregate order);
    Task UpdateOrderTotals(OrderAggregate order);
    Task DecreaseStockAsync(OrderAggregate order);
}
