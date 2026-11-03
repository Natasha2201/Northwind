
namespace NorthWind.Membership.Backend.AspNetIdentity.DataContexts;
internal class NorthWindMembershipContext(IOptions<MembershipDBOptions> dbOptions)
    : IdentityDbContext<NorthWindUser>
{
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(dbOptions.Value.ConnectionString);
        base.OnConfiguring(optionsBuilder);
    }
}
