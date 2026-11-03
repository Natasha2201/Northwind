using NorthWind.Transactions.Entities.Interfaces;
﻿using Microsoft.Extensions.DependencyInjection;
using NorthWind.Sales.Backend.DataContexts.EFCore.Options;
using NorthWind.Sales.Backend.DataContexts.EFCore.Services;
using NorthWind.Sales.Backend.Repositories.Interfaces;

namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddDataContexts(
        this IServiceCollection services,
        Action<DBOptions> configureDBOptions)
    {
        services.Configure(configureDBOptions);
        services.AddScoped<INorthWindSalesCommandsDataContext, NorthWindSalesCommandsDataContext>();
        services.AddScoped<ILocalTransactionContext>(provider =>
            (ILocalTransactionContext)provider.GetRequiredService<INorthWindSalesCommandsDataContext>());
        services.AddScoped<INorthWindSalesQueriesDataContext, NorthWindSalesQueriesDataContext>();
        services.AddScoped<INorthWindDomainLogsDataContext, NorthWindDomainLogsDataContext>();
        return services;
    }
}
