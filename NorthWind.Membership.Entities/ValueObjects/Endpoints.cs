namespace NorthWind.Membership.Entities.ValueObjects;

public class Endpoints
{
    public const string Register = $"/api/user/{nameof(Register)}";
    public const string Login = $"/api/user/{nameof(Login)}";
}
