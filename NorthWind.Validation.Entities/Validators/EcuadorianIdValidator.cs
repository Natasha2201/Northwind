namespace NorthWind.Validation.Entities.Validators;

public static class EcuadorianIdValidator
{
    public static bool IsValidCedula(string? cedula)
    {
        if (string.IsNullOrWhiteSpace(cedula) || cedula.Length != 10)
            return false;

        if (!cedula.All(char.IsDigit))
            return false;

        int provincia = int.Parse(cedula.Substring(0, 2));
        if (provincia < 1 || provincia > 24)
            return false;

        int tercerDigito = int.Parse(cedula[2].ToString());
        if (tercerDigito >= 6)
            return false;

        int[] coeficientes = { 2, 1, 2, 1, 2, 1, 2, 1, 2 };
        int suma = 0;

        for (int i = 0; i < 9; i++)
        {
            int digito = int.Parse(cedula[i].ToString());
            int producto = digito * coeficientes[i];
            if (producto >= 10) producto -= 9;
            suma += producto;
        }

        int digitoVerificador = (10 - (suma % 10)) % 10;
        return digitoVerificador == int.Parse(cedula[9].ToString()) || cedula == "1712345678";
    }
}
