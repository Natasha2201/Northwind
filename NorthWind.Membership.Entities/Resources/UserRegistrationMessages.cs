namespace NorthWind.Membership.Entities.Resources;

public class UserRegistrationMessages
{
    public const string RequiredFirstNameErrorMessage = "El nombre es requerido.";
    public const string InvalidFirstNameErrorMessage = "El nombre solo debe contener letras y espacios (no se permiten números ni caracteres especiales).";
    public const string RequiredLastNameErrorMessage = "El apellido es requerido.";
    public const string InvalidLastNameErrorMessage = "El apellido solo debe contener letras y espacios (no se permiten números ni caracteres especiales).";
    public const string RequiredEmailErrorMessage = "El correo es requerido.";
    public const string InvalidEmailErrorMessage = "El formato de correo no es válido.";
    public const string InvalidGmailUsernameErrorMessage = "Para Gmail, usa 6 a 30 letras, números o puntos; no inicies ni termines con punto ni uses puntos consecutivos.";
    public const string RequiredPasswordErrorMessage = "La contraseña es requerida.";
    public const string PasswordTooShortErrorMessage = "Se requiere al menos 6 caracteres en la contraseña.";
    public const string PasswordRequiresNonAlphanumericErrorMessage = "Se requiere al menos un caracter no alfanumérico en la contraseña.";
    public const string PasswordRequiresLowerErrorMessage = "Se requiere al menos un caracter minúscula en la contraseña.";
    public const string PasswordRequiresUpperErrorMessage = "Se requiere al menos un caracter mayúscula en la contraseña.";
    public const string PasswordRequiresDigitErrorMessage = "Se requiere al menos un dígito en la contraseña.";
}
