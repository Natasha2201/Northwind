
namespace NorthWind.Membership.Backend.AspNetIdentity.DataContexts;
internal class NorthWindMembershipContextFactory :
    IDesignTimeDbContextFactory<NorthWindMembershipContext>
{
    public NorthWindMembershipContext CreateDbContext(string[] args)
    {
        IOptions<MembershipDBOptions> DbOptions =
            Microsoft.Extensions.Options.Options.Create(
                new MembershipDBOptions
                {
                    ConnectionString = "Server=DESKTOP-DKRNDEQ\\SITIO_B;Database=NorthWindUsersDB;TrustServerCertificate=True;Integrated Security=True"
                });
        return new NorthWindMembershipContext(DbOptions);
    }
}
