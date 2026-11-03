using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using NorthWind.RazorComponents.Validators;
using NorthWind.Sales.Entities.Dtos.CreateOrder;
using NorthWind.Sales.Frontend.BusinessObjects.Interfaces;
using NorthWind.Sales.Frontend.Views.Resources;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.Sales.Frontend.Views.ViewModels.CreateOrder;
public class CreateOrderViewModel
{
    private readonly ICreateOrderGateway gateway;
    private readonly IProductGateway productGateway;
    public IModelValidatorHub<CreateOrderViewModel> Validator { get; }
    public ModelValidator<CreateOrderViewModel> ModelValidatorComponentReference { get; set; }

    public CreateOrderViewModel(
        ICreateOrderGateway gateway,
        IProductGateway productGateway,
        IModelValidatorHub<CreateOrderViewModel> validator)
    {
        this.gateway = gateway;
        this.productGateway = productGateway;
        Validator = validator;
    }

    #region Propiedades relacionadas a CreateOrderDto
    public string CustomerId { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; } = DateTime.Now;
    public string ShipAddress { get; set; } = string.Empty;
    public string ShipCity { get; set; } = string.Empty;
    public string ShipCountry { get; set; } = string.Empty;
    public string ShipPostalCode { get; set; } = string.Empty;
    public List<CreateOrderDetailViewModel> OrderDetails { get; set; } = [];
    public decimal Total => OrderDetails.Sum(d => d.UnitPrice * d.Quantity);
    #endregion

    public string InformationMessage { get; set; } = string.Empty;
    public bool IsErrorMessage { get; set; } = true;
    public int LastCreatedOrderId { get; private set; }

    public void AddNewOrderDetailItem()
    {
        OrderDetails.Add(new CreateOrderDetailViewModel());
    }

    public void RemoveDetail(int productId)
    {
        var detail = OrderDetails.FirstOrDefault(d => d.ProductId == productId);
        if (detail != null)
        {
            OrderDetails.Remove(detail);
        }
    }

    public void UpdateDetail(int productId, short newQuantity)
    {
        var detail = OrderDetails.FirstOrDefault(d => d.ProductId == productId);
        if (detail != null)
        {
            if (newQuantity <= 0)
            {
                RemoveDetail(productId);
            }
            else
            {
                detail.Quantity = newQuantity;
            }
        }
    }

    public async Task<bool> ValidateProductsExistAsync(IProductGateway? targetGateway = null)
    {
        var activeGateway = targetGateway ?? productGateway;
        var tasks = OrderDetails.Select(async detail =>
        {
            var result = await activeGateway.SearchAsync(detail.ProductId.ToString(), 1, 10);
            var product = result.Items.FirstOrDefault(p => p.Id == detail.ProductId);
            return (Detail: detail, Product: product);
        });

        var results = await Task.WhenAll(tasks);

        foreach (var (detail, product) in results)
        {
            if (product == null)
            {
                InformationMessage = $"El producto {detail.ProductName} ya no existe en la base de datos. Por favor, elimínelo de la orden.";
                IsErrorMessage = true;
                return false;
            }
            if (product.UnitsInStock < detail.Quantity)
            {
                InformationMessage = $"No hay suficiente stock para {detail.ProductName} (disponible: {product.UnitsInStock}).";
                IsErrorMessage = true;
                return false;
            }
        }
        return true;
    }

    public async Task Send()
    {
        InformationMessage = "";
        IsErrorMessage = false;
        LastCreatedOrderId = 0;
        try
        {
            if (!await ValidateProductsExistAsync())
            {
                IsErrorMessage = true;
                return;
            }

            var OrderId = await gateway.CreateOrderAsync((CreateOrderDto)this);
            LastCreatedOrderId = OrderId;
            InformationMessage = string.Empty;

            if (OrderId > 0)
            {
                CustomerId = string.Empty;
                ShipAddress = string.Empty;
                ShipCity = string.Empty;
                ShipCountry = string.Empty;
                ShipPostalCode = string.Empty;
                OrderDetails.Clear();
            }
        }
        catch (HttpRequestException ex)
        {
            IsErrorMessage = true;
            if (ex.Data.Contains("Errors"))
            {
                IEnumerable<ValidationError> Errors = ex.Data["Errors"] as IEnumerable<ValidationError>;
                ModelValidatorComponentReference.AddErrors(Errors);
            }
            else
            {
                throw;
            }
        }
    }

    public static explicit operator CreateOrderDto(CreateOrderViewModel model) =>
        new CreateOrderDto(
            model.CustomerId, model.ShipAddress, model.ShipCity,
            model.ShipCountry, model.ShipPostalCode,
            model.OrderDetails.Select(d => new CreateOrderDetailDto(
                d.ProductId, d.UnitPrice, d.Quantity)));
}
