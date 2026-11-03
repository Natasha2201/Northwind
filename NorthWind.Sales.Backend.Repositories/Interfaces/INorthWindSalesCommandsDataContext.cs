namespace NorthWind.Sales.Backend.Repositories.Interfaces;

public interface INorthWindSalesCommandsDataContext
{
    Task AddOrderAsync(Entities.Order order);
    Task<Entities.Order?> FindOrderAsync(int id);
    Task<Entities.Product?> FindProductAsync(int productId);
    Task<string?> FindCustomerIdByIdentificationAsync(string identification);
    Task AddOrderDetailsAsync(IEnumerable<Entities.OrderDetail> orderDetails);
    Task SaveChangesAsync();
}
