
namespace Microsoft.Extensions.DependencyInjection;
public static class DependencyContainer
{
    public static IServiceCollection AddMembershipIdentityServices(
        this IServiceCollection services,
        Action<MembershipDBOptions> configureMembershipDBOptions)
    {
        services.AddDbContext<NorthWindMembershipContext>();
        services.AddIdentityCore<NorthWindUser>()
            .AddEntityFrameworkStores<NorthWindMembershipContext>();
        services.AddScoped<IMembershipService, MembershipService>();
        services.Configure(configureMembershipDBOptions);
        return services;
    }
}
