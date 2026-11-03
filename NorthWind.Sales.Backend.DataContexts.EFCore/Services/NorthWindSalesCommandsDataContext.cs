using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore.Storage;
using NorthWind.Sales.Backend.DataContexts.EFCore.DataContexts;
using NorthWind.Sales.Backend.DataContexts.EFCore.Guards;
using NorthWind.Sales.Backend.DataContexts.EFCore.Options;
using NorthWind.Sales.Backend.Repositories.Entities;
using NorthWind.Sales.Backend.Repositories.Interfaces;
using NorthWind.Transactions.Entities.Interfaces;

namespace NorthWind.Sales.Backend.DataContexts.EFCore.Services;

internal class NorthWindSalesCommandsDataContext(IOptions<DBOptions> dbOptions) :
    NorthWindSalesContext(dbOptions), INorthWindSalesCommandsDataContext, ILocalTransactionContext
{
    private IDbContextTransaction? transaction;

    public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
    {
        if (transaction is not null)
        {
            throw new InvalidOperationException("A local database transaction is already active.");
        }

        transaction = await Database.BeginTransactionAsync(cancellationToken);
    }

    public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
    {
        var activeTransaction = transaction ?? throw new InvalidOperationException("No local database transaction is active.");
        try
        {
            await activeTransaction.CommitAsync(cancellationToken);
        }
        finally
        {
            await activeTransaction.DisposeAsync();
            transaction = null;
        }
    }

    public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
    {
        var activeTransaction = transaction;
        if (activeTransaction is null) return;

        try
        {
            await activeTransaction.RollbackAsync(cancellationToken);
        }
        finally
        {
            await activeTransaction.DisposeAsync();
            transaction = null;
        }
    }
    public async Task AddOrderAsync(Order order) => await AddAsync(order);
    public async Task<Order?> FindOrderAsync(int id) => await Orders.FindAsync(id);
    public async Task<Product?> FindProductAsync(int productId) => await Products.FindAsync(productId);
    public async Task<string?> FindCustomerIdByIdentificationAsync(string identification) =>
        (await Microsoft.EntityFrameworkCore.EntityFrameworkQueryableExtensions.FirstOrDefaultAsync(Customers, c => c.Identification == identification))?.Id;
    public async Task AddOrderDetailsAsync(IEnumerable<NorthWind.Sales.Backend.Repositories.Entities.OrderDetail> orderDetails) =>
        await AddRangeAsync(orderDetails);
    public async Task SaveChangesAsync() =>
        await GuardDBContext.AgainstSaveChangesErrorAsync(this);
}
