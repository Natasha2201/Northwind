using System.Net.Http.Json;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;
using NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

namespace NorthWind.Sales.Frontend.WebApiGateways;

internal class CustomerGateway(HttpClient httpClient) : ICustomerGateway
{
    public async Task<PagedResult<CustomerSearchDto>> SearchAsync(
        string searchTerm, int page, int pageSize, string searchCriteria = "Todos")
    {
        var url = $"api/customers/search?q={Uri.EscapeDataString(searchTerm)}&criteria={Uri.EscapeDataString(searchCriteria)}&page={page}&pageSize={pageSize}";
        return await httpClient.GetFromJsonAsync<PagedResult<CustomerSearchDto>>(url)
            ?? new PagedResult<CustomerSearchDto>([], 0, page, pageSize);
    }
}
