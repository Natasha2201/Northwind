using System.ComponentModel.DataAnnotations;
using NorthWind.Validation.Entities.Validators;

namespace NorthWind.Sales.Frontend.Views.ViewModels.Customer;

public class CustomerViewModel
{
    [Required(ErrorMessage = "La cédula es requerida.")]
    [StringLength(10, MinimumLength = 10, ErrorMessage = "La cédula debe tener exactamente 10 dígitos.")]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "La cédula debe contener solo números.")]
    [CustomValidation(typeof(CedulaValidator), nameof(CedulaValidator.IsValid), 
        ErrorMessage = "La cédula ingresada no es válida.")]
    public string Identification { get; set; } = string.Empty;

    [Required(ErrorMessage = "El nombre es requerido.")]
    [MaxLength(60, ErrorMessage = "El nombre no puede exceder 60 caracteres.")]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es requerido.")]
    [MaxLength(60, ErrorMessage = "El apellido no puede exceder 60 caracteres.")]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es requerido.")]
    [EmailAddress(ErrorMessage = "El formato de correo no es válido.")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20, ErrorMessage = "El teléfono no puede exceder 20 caracteres.")]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(200, ErrorMessage = "La dirección no puede exceder 200 caracteres.")]
    public string Address { get; set; } = string.Empty;
}
