using CustomerEntity = NorthWind.Sales.Backend.BusinessObjects.POCOEntities.Customer;
using NorthWind.Validation.Entities.Abstractions;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.Validators;

namespace NorthWind.Sales.Validators.Entities.Customer;

internal class CustomerValidator : AbstractModelValidator<CustomerEntity>
{
    public CustomerValidator(IValidationService<CustomerEntity> validationService)
        : base(validationService)
    {
        AddRuleFor(c => c.Identification)
            .NotEmpty("La cédula es requerida.")
            .Must(CedulaValidator.IsValid, "La cédula no es válida.");

        AddRuleFor(c => c.FirstName)
            .NotEmpty("El nombre es requerido.")
            .MaximumLength(60, "El nombre no puede exceder 60 caracteres.");

        AddRuleFor(c => c.LastName)
            .NotEmpty("El apellido es requerido.")
            .MaximumLength(60, "El apellido no puede exceder 60 caracteres.");

        AddRuleFor(c => c.Email)
            .NotEmpty("El correo es requerido.")
            .EmailAddress("El formato de correo no es válido.");

        AddRuleFor(c => c.Phone)
            .MaximumLength(20, "El teléfono no puede exceder 20 caracteres.");

        AddRuleFor(c => c.Address)
            .MaximumLength(200, "La dirección no puede exceder 200 caracteres.");
    }
}
