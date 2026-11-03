namespace NorthWind.Sales.Backend.UseCases.CreateOrder;
internal class SendEMailWhenSpecialOrderCreatedEventHandler(IMailService mailService) :
    IDomainEventHandler<SpecialOrderCreatedEvent>
{
    public Task Handle(SpecialOrderCreatedEvent createdOrder)
    {
        return mailService.SendMailToAdministrator(
            CreateOrderMessages.SendEmailSubject,
            string.Format(CreateOrderMessages.SendEmailBodyTemplate,
                createdOrder.OrderId, createdOrder.ProductsCount));
    }
}
