internal class CreateOrderPresenter : ICreateOrderOutputPort
{
    public int OrderId { get; private set; }
    public Task Handle(OrderAggregate addedOrder)
    {
        OrderId = addedOrder.Id;
        return Task.CompletedTask;
    }
}
