namespace NorthWind.Sales.Backend.BusinessObjects.ValueObjects;

public class CustomerSearchDto(
    string id,
    string identification,
    string firstName,
    string lastName,
    string email,
    string address,
    decimal currentBalance = 0)
{
    public string Id => id;
    public string Identification => identification;
    public string FirstName => firstName;
    public string LastName => lastName;
    public string Email => email;
    public string Address => address;
    public string FullName => $"{firstName} {lastName}";
    public decimal CurrentBalance => currentBalance;
    public decimal PendingDebt => currentBalance;
}
