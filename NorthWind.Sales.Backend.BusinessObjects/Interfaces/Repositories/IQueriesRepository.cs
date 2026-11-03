namespace NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
public interface IQueriesRepository
{
    Task<decimal?> GetCustomerCurrentBalance(string customerId);
    Task<IEnumerable<ProductUnitsInStock>> GetProductsUnitsInStock(IEnumerable<int> productIds);
    Task<IEnumerable<ProductDto>> GetAvailableProductsAsync();
    Task<PagedResult<CustomerSearchDto>> SearchCustomersAsync(
        string searchTerm, string searchCriteria, int page, int pageSize);
    Task<PagedResult<ProductSearchDto>> SearchProductsAsync(
        string searchTerm, string searchCriteria, int page, int pageSize);
    Task<InvoiceDto?> GetInvoiceAsync(int orderId);
    Task<PagedResult<InvoiceSearchDto>> SearchInvoicesAsync(
        string searchTerm, string searchCriteria, int page, int pageSize,
        DateTime? dateFrom = null, DateTime? dateTo = null);
}
