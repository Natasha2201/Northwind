using NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface IInvoiceGateway
{
    Task<InvoiceDto?> GetInvoiceAsync(int orderId);
    Task<byte[]> GetInvoicePdfAsync(int orderId);
    Task<PagedResult<InvoiceSearchDto>> SearchInvoicesAsync(
        string searchTerm, string searchCriteria, int page, int pageSize,
        DateTime? dateFrom = null, DateTime? dateTo = null);
}
