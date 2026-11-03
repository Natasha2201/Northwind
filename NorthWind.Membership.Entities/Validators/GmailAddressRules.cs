namespace NorthWind.Membership.Entities.Validators;

internal static class GmailAddressRules
{
    public static bool IsValidUsernameWhenGmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return true;

        var separator = email.LastIndexOf('@');
        if (separator < 0)
            return true;

        var domain = email[(separator + 1)..];
        if (!domain.Equals("gmail.com", StringComparison.OrdinalIgnoreCase) &&
            !domain.Equals("googlemail.com", StringComparison.OrdinalIgnoreCase))
            return true;

        var username = email[..separator];
        return username.Length is >= 6 and <= 30 &&
               username[0] != '.' &&
               username[^1] != '.' &&
               !username.Contains("..", StringComparison.Ordinal) &&
               username.All(character =>
                   character is >= 'a' and <= 'z' or >= 'A' and <= 'Z' or >= '0' and <= '9' or '.');
    }
}
