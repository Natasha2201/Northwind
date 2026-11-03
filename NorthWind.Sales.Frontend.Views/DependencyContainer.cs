using Microsoft.Extensions.DependencyInjection;
using NorthWind.Sales.Frontend.Views.ViewModels.CreateOrder;

namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddViewsServices(this IServiceCollection services)
    {
        services.AddScoped<CreateOrderViewModel>();
        services.AddModelValidator<CreateOrderViewModel, CreateOrderViewModelValidator>();
        return services;
    }
}
