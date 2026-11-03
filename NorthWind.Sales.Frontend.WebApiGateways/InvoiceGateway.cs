using System.Net.Http.Json;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;
using NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

namespace NorthWind.Sales.Frontend.WebApiGateways;

internal class InvoiceGateway(HttpClient httpClient) : IInvoiceGateway
{
    public async Task<InvoiceDto?> GetInvoiceAsync(int orderId) =>
        await httpClient.GetFromJsonAsync<InvoiceDto>($"api/orders/{orderId}/invoice");

    public async Task<byte[]> GetInvoicePdfAsync(int orderId) =>
        await httpClient.GetByteArrayAsync($"api/orders/{orderId}/invoice/pdf");

    public async Task<PagedResult<InvoiceSearchDto>> SearchInvoicesAsync(
        string searchTerm, string searchCriteria, int page, int pageSize,
        DateTime? dateFrom = null, DateTime? dateTo = null)
    {
        var url = $"api/orders/search?q={Uri.EscapeDataString(searchTerm)}&criteria={Uri.EscapeDataString(searchCriteria)}&page={page}&pageSize={pageSize}";
        if (dateFrom.HasValue)
            url += $"&dateFrom={Uri.EscapeDataString(dateFrom.Value.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture))}";
        if (dateTo.HasValue)
            url += $"&dateTo={Uri.EscapeDataString(dateTo.Value.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture))}";
        return await httpClient.GetFromJsonAsync<PagedResult<InvoiceSearchDto>>(url)
            ?? new PagedResult<InvoiceSearchDto>([], 0, page, pageSize);
    }
}
