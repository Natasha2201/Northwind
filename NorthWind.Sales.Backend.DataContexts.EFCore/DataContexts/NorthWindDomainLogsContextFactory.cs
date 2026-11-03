
namespace NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;
internal class NorthWindDomainLogsContextFactory : IDesignTimeDbContextFactory<NorthWindDomainLogsContext>
{
    public NorthWindDomainLogsContext CreateDbContext(string[] args)
    {
        IOptions<DBOptions> DbOptions =
            Microsoft.Extensions.Options.Options.Create(
                new DBOptions
                {
                    DomainLogsConnectionString = "Server=DESKTOP-DKRNDEQ\\SITIO_B;Database=NorthWindLogsDB;TrustServerCertificate=True;Integrated Security=True"
                });
        return new NorthWindDomainLogsContext(DbOptions);
    }
}
