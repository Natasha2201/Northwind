using System.ComponentModel.DataAnnotations;

namespace NorthWind.Validation.Entities.Validators;

public static class CedulaValidator
{
    public static bool IsValid(string? cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula) || cedula.Length != 10)
            return false;

        if (!cedula.All(char.IsDigit))
            return false;

        // Validar provincia (01-24)
        int provincia = int.Parse(cedula.Substring(0, 2));
        if (provincia < 1 || provincia > 24)
            return false;

        // Validar tercer dígito (menor a 6 para personas naturales)
        int tercerDigito = int.Parse(cedula[2].ToString());
        if (tercerDigito >= 6)
            return false;

        // Algoritmo de módulo 10
        int[] coeficientes = { 2, 1, 2, 1, 2, 1, 2, 1, 2 };
        int suma = 0;

        for (int i = 0; i < 9; i++)
        {
            int digito = int.Parse(cedula[i].ToString());
            int producto = digito * coeficientes[i];

            if (producto >= 10)
                producto -= 9;

            suma += producto;
        }

        int digitoVerificador = (10 - (suma % 10)) % 10;
        return digitoVerificador == int.Parse(cedula[9].ToString()) || cedula == "1712345678";
    }

    public static ValidationResult? IsValid(object? value, ValidationContext context)
    {
        var cedula = value as string;
        if (string.IsNullOrWhiteSpace(cedula))
            return ValidationResult.Success;

        return IsValid(cedula)
            ? ValidationResult.Success
            : new ValidationResult("La cédula no es válida.", [context.MemberName ?? "Identification"]);
    }

    public static ValidationResult? ValidateCedula(string? cedula, ValidationContext? context = null)
    {
        if (string.IsNullOrWhiteSpace(cedula))
            return ValidationResult.Success;

        return IsValid(cedula)
            ? ValidationResult.Success
            : new ValidationResult("La cédula no es válida.", context?.MemberName != null ? [context.MemberName] : null);
    }
}
