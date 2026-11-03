using NorthWind.DomainLogs.Entities.Interfaces;
using NorthWind.Sales.Backend.Repositories.Interfaces;

namespace NorthWind.Sales.Backend.Repositories.Repositories;
internal class DomainLogsRepository(INorthWindDomainLogsDataContext context) : IDomainLogsRepository
{
    public async Task Add(DomainLogs.Entities.ValueObjects.DomainLog log)
    {
        await context.AddLogAsync(new Entities.DomainLog
        {
            CreatedDate = log.DateTime,
            Information = log.Information,
            UserName = log.UserName
        });
    }
    public async Task SaveChanges() =>
        await context.SaveChangesAsync();
}
