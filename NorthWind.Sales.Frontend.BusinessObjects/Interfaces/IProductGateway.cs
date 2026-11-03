using NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface IProductGateway
{
    Task<PagedResult<ProductSearchDto>> SearchAsync(
        string searchTerm, int page, int pageSize, string searchCriteria = "Todos");
}
