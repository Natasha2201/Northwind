using NorthWind.Validation.Entities.Validators;
using NorthWind.Sales.Validators.Entities.Resources;

namespace NorthWind.Sales.Validators.Entities.CreateOrder;
internal class CreateOrderDtoValidator : AbstractModelValidator<CreateOrderDto>
{
    public CreateOrderDtoValidator(
        IValidationService<CreateOrderDto> validationService,
        IModelValidator<CreateOrderDetailDto> detailValidator) : base(validationService)
    {
        AddRuleFor(c => c.CustomerId)
            .NotEmpty(CreateOrderMessages.CustomerIdRequired)
            .Must(id => id.Length == 5 || CedulaValidator.IsValid(id), "La cédula no es válida.");
        AddRuleFor(c => c.ShipAddress)
            .NotEmpty(CreateOrderMessages.ShipAddressRequired)
            .MaximumLength(60, CreateOrderMessages.ShipAddressMaximumLength);
        AddRuleFor(c => c.ShipCity)
            .NotEmpty(CreateOrderMessages.ShipCityRequired)
            .MinimumLength(3, CreateOrderMessages.ShipCityMinimumLength)
            .MaximumLength(15, CreateOrderMessages.ShipCityMaximumLength);
        AddRuleFor(c => c.ShipCountry)
            .NotEmpty(CreateOrderMessages.ShipCountryRequired)
            .MinimumLength(3, CreateOrderMessages.ShipCountryMinimumLength)
            .MaximumLength(15, CreateOrderMessages.ShipCountryMaximumLength);
        AddRuleFor(c => c.ShipPostalCode)
            .NotEmpty(CreateOrderMessages.ShipPostalCodeRequired)
            .Length(6, CreateOrderMessages.ShipPostalCodeLength)
            .Must(postalCode => postalCode.All(char.IsDigit), CreateOrderMessages.ShipPostalCodeDigitsOnly);
        AddRuleFor(c => c.OrderDetails)
            .NotNull(CreateOrderMessages.OrderDetailsRequired)
            .NotEmpty(CreateOrderMessages.OrderDetailsNotEmpty);
        AddRuleForEach(c => c.OrderDetails)
            .SetValidator(detailValidator);
    }
}
