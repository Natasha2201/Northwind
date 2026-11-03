

using NorthWind.Sales.Backend.BusinessObjects.POCOEntities;
using NorthWind.Sales.Validators.Entities.Customer;

namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddValidators(this IServiceCollection services)
    {
        services.AddModelValidator<CreateOrderDto, CreateOrderDtoValidator>();
        services.AddModelValidator<CreateOrderDetailDto, CreateOrderDetailDtoValidator>();
        services.AddModelValidator<Customer, CustomerValidator>();
        return services;
    }
}
