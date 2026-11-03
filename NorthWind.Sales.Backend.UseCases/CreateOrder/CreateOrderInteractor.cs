namespace NorthWind.Sales.Backend.UseCases.CreateOrder;
internal class CreateOrderInteractor(
    ICreateOrderOutputPort outputPort,
    ICommandsRepository repository,
    IModelValidatorHub<CreateOrderDto> modelValidatorHub,
    IDomainEventHub<SpecialOrderCreatedEvent> domainEventHub,
    IDomainLogger domainLogger,
    IDomainTransaction domainTransaction,
    IUserService userService) : ICreateOrderInputPort
{
    public async Task Handle(CreateOrderDto orderDto)
    {
        GuardUser.AgainstUnauthenticated(userService);
        await GuardModel.AgainstNotValid(modelValidatorHub, orderDto);
        await domainLogger.LogInformation(new DomainLog(
            CreateOrderMessages.StartingPurchaseOrderCreation,
            userService.UserName));

        OrderAggregate Order = OrderAggregate.From(orderDto);
        try
        {
            await domainTransaction.BeginTransactionAsync();
            await repository.CreateOrder(Order);
            await repository.SaveChanges();

            await repository.DecreaseStockAsync(Order);

            Order.GenerateInvoiceNumber();
            Order.CalculateTotals();
            await repository.UpdateOrderTotals(Order);
            await repository.SaveChanges();
            await domainTransaction.CommitTransactionAsync();
        }
        catch
        {
            await domainTransaction.RollbackTransactionAsync();
            string Information = string.Format(
                CreateOrderMessages.OrderCreationCancelledTemplate,
                Order.Id);
            await domainLogger.LogInformation(new DomainLog(Information, userService.UserName));
            throw;
        }

        await domainLogger.LogInformation(new DomainLog(string.Format(
            CreateOrderMessages.PurchaseOrderCreatedTemplate,
            Order.Id), userService.UserName));
        await outputPort.Handle(Order);

        if (new SpecialOrderSpecification().IsSatisfiedBy(Order))
        {
            _ = Task.Run(async () =>
            {
                try
                {
                    await domainEventHub.Raise(new SpecialOrderCreatedEvent(Order.Id, Order.OrderDetails.Count));
                }
                catch
                {
                    // Evitar que fallas o latencia en el servidor SMTP bloqueen la creación de la orden
                }
            });
        }
    }
}
