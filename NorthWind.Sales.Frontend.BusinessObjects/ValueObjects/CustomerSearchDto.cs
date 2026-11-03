namespace NorthWind.Sales.Frontend.BusinessObjects.ValueObjects;

public class CustomerSearchDto
{
    public string Id { get; set; } = string.Empty;
    public string Identification { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();

    public CustomerSearchDto() { }

    public CustomerSearchDto(
        string id,
        string identification,
        string firstName,
        string lastName,
        string email)
    {
        Id = id;
        Identification = identification;
        FirstName = firstName;
        LastName = lastName;
        Email = email;
    }
}
