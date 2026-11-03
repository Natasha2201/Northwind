using System.Net.Http.Json;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;
using NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

namespace NorthWind.Sales.Frontend.WebApiGateways;

internal class ProductGateway(HttpClient httpClient) : IProductGateway
{
    public async Task<PagedResult<ProductSearchDto>> SearchAsync(
        string searchTerm, int page, int pageSize, string searchCriteria = "Todos")
    {
        var url = $"api/products/search?q={Uri.EscapeDataString(searchTerm)}&criteria={Uri.EscapeDataString(searchCriteria)}&page={page}&pageSize={pageSize}";
        return await httpClient.GetFromJsonAsync<PagedResult<ProductSearchDto>>(url)
            ?? new PagedResult<ProductSearchDto>([], 0, page, pageSize);
    }
}
