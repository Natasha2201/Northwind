namespace NorthWind.Sales.Validators.Entities.Resources;

public class CreateOrderMessages
{
    public const string ProductIdGreaterThanZero = "Debe especificar el identificador del producto.";
    public const string QuantityGreaterThanZero = "Debe especificar la cantidad ordenada del producto.";
    public const string UnitPriceGreaterThanZero = "Debe especificarse el precio del producto.";
    public const string CustomerIdRequired = "Debe proporcionar el identificador del cliente.";
    public const string CustomerIdRequiredLength = "La longitud del identificador debe ser 5.";
    public const string ShipAddressRequired = "Debe proporcionar la dirección de envío.";
    public const string ShipAddressMaximumLength = "La longitud máxima de la dirección es 60.";
    public const string ShipCityRequired = "Debe proporcionar la ciudad de envío.";
    public const string ShipCityMinimumLength = "Debe especificar al menos 3 caracteres del nombre de la ciudad.";
    public const string ShipCityMaximumLength = "La longitud máxima de la ciudad es 15.";
    public const string ShipCountryRequired = "Debe proporcionar el país de envío.";
    public const string ShipCountryMinimumLength = "Debe especificar al menos 3 caracteres del nombre del País.";
    public const string ShipCountryMaximumLength = "La longitud máxima del país es 15.";
    public const string ShipPostalCodeRequired = "Debe proporcionar el código postal de envío.";
    public const string ShipPostalCodeLength = "El código postal debe tener exactamente 6 dígitos.";
    public const string ShipPostalCodeDigitsOnly = "El código postal solo puede contener números.";
    public const string OrderDetailsRequired = "Debe especificar los productos de la orden.";
    public const string OrderDetailsNotEmpty = "Debe especificar al menos un producto de la orden.";
}
