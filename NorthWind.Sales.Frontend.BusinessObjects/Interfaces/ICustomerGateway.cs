using NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

namespace NorthWind.Sales.Frontend.BusinessObjects.Interfaces;

public interface ICustomerGateway
{
    Task<PagedResult<CustomerSearchDto>> SearchAsync(
        string searchTerm, int page, int pageSize, string searchCriteria = "Todos");
}
