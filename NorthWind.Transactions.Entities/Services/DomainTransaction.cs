namespace NorthWind.Transactions.Entities.Services;

internal sealed class DomainTransaction(ILocalTransactionContext context) : IDomainTransaction
{
    public Task BeginTransactionAsync(CancellationToken cancellationToken = default) =>
        context.BeginTransactionAsync(cancellationToken);

    public Task CommitTransactionAsync(CancellationToken cancellationToken = default) =>
        context.CommitTransactionAsync(cancellationToken);

    public Task RollbackTransactionAsync(CancellationToken cancellationToken = default) =>
        context.RollbackTransactionAsync(cancellationToken);
}
