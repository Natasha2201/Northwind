using Microsoft.Extensions.DependencyInjection;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;
using NorthWind.Sales.Frontend.WebApiGateways;

namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddWebApiGateways(
        this IServiceCollection services,
        Action<HttpClient> configureHttpClient,
        Action<IHttpClientBuilder> configureHttpClientBuilder)
    {
        services.AddExceptionDelegatingHandler();
        var Builder = services
            .AddHttpClient<ICreateOrderGateway, CreateOrderGateway>(configureHttpClient)
            .AddHttpMessageHandler<NorthWind.HttpDelegatingHandlers.ExceptionDelegatingHandler>();
        configureHttpClientBuilder(Builder);

        var invoiceBuilder = services
            .AddHttpClient<IInvoiceGateway, InvoiceGateway>(configureHttpClient)
            .AddHttpMessageHandler<NorthWind.HttpDelegatingHandlers.ExceptionDelegatingHandler>();
        configureHttpClientBuilder(invoiceBuilder);

        var customerBuilder = services
            .AddHttpClient<ICustomerGateway, CustomerGateway>(configureHttpClient)
            .AddHttpMessageHandler<NorthWind.HttpDelegatingHandlers.ExceptionDelegatingHandler>();
        configureHttpClientBuilder(customerBuilder);

        var productBuilder = services
            .AddHttpClient<IProductGateway, ProductGateway>(configureHttpClient)
            .AddHttpMessageHandler<NorthWind.HttpDelegatingHandlers.ExceptionDelegatingHandler>();
        configureHttpClientBuilder(productBuilder);

        return services;
    }
}
