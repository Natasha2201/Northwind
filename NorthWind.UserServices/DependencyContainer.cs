namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyContainer
{
    public static IServiceCollection AddUserServices(
        this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        services.AddSingleton<IUserService, UserService>();
        // services.AddSingleton<IUserService, UserServiceFake>(); // ← Para pruebas
        return services;
    }
}