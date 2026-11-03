namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddTransactionServices(this IServiceCollection services)
    {
        services.AddScoped<IDomainTransaction, DomainTransaction>();
        return services;
    }
}
