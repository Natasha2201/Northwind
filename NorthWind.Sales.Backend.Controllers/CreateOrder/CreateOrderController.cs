using Microsoft.AspNetCore.Builder;
using NorthWind.Exceptions.Entities.Exceptions;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.CreateOrder;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Sales.Entities.ValueObjects;
using NorthWind.Validation.Entities.ValueObjects;

namespace Microsoft.AspNetCore.Builder;
public static class CreateOrderController
{
    public static WebApplication UseCreateOrderController(this WebApplication app)
    {
        app.MapPost(Endpoints.CreateOrder, CreateOrder)
            .RequireAuthorization();
        return app;
    }
    public static async Task<int> CreateOrder(
        CreateOrderDto orderDto,
        ICreateOrderInputPort inputPort,
        ICreateOrderOutputPort presenter)
    {
        // Validar que no haya productos duplicados en el DTO
        var duplicatedProducts = orderDto.OrderDetails
            .GroupBy(d => d.ProductId)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key)
            .ToList();

        if (duplicatedProducts.Any())
        {
            throw new ValidationException(new[]
            {
                new ValidationError("OrderDetails", 
                    $"Los productos con ID {string.Join(", ", duplicatedProducts)} están duplicados.")
            });
        }

        await inputPort.Handle(orderDto);
        return presenter.OrderId;
    }
}
