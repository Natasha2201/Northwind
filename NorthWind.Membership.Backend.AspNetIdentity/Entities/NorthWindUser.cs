using Microsoft.AspNetCore.Identity;

namespace NorthWind.Membership.Backend.AspNetIdentity.Entities;
internal class NorthWindUser : IdentityUser
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
}
