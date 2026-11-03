using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using NorthWind.Membership.Backend.Core.Resources;

namespace NorthWind.Membership.Backend.AspNetIdentity.Services;
internal class MembershipService(UserManager<NorthWindUser> manager) : IMembershipService
{
    public async Task<Result<IEnumerable<ValidationError>>> Register(UserRegistrationDto userData)
    {
        var existingUser = await manager.FindByEmailAsync(userData.Email);
        if (existingUser is not null)
        {
            return DuplicateEmailResult();
        }

        var user = new NorthWindUser
        {
            UserName = userData.Email,
            Email = userData.Email,
            FirstName = userData.FirstName,
            LastName = userData.LastName
        };

        try
        {
            var createResult = await manager.CreateAsync(user, userData.Password);
            if (createResult.Succeeded)
            {
                return new Result<IEnumerable<ValidationError>>();
            }

            if (createResult.Errors.Any(error =>
                error.Code is nameof(IdentityErrorDescriber.DuplicateEmail)
                    or nameof(IdentityErrorDescriber.DuplicateUserName)))
            {
                return DuplicateEmailResult();
            }

            return new Result<IEnumerable<ValidationError>>(createResult.Errors.ToValidationErrors());
        }
        catch (DbUpdateException exception) when (IsDuplicateKeyViolation(exception))
        {
            // Another request may have registered the same email after FindByEmailAsync.
            return DuplicateEmailResult();
        }
    }

    public async Task<UserDto> GetUserByCredentials(UserCredentialsDto userData)
    {
        UserDto foundUser = null;
        var user = await manager.FindByNameAsync(userData.Email);
        if (user is not null && await manager.CheckPasswordAsync(user, userData.Password))
        {
            foundUser = new UserDto(user.UserName, user.FirstName, user.LastName);
        }
        return foundUser;
    }

    private static Result<IEnumerable<ValidationError>> DuplicateEmailResult() =>
        new(new[] { new ValidationError(nameof(UserRegistrationDto.Email), UserRegistrationMessages.DuplicateEmail) });

    private static bool IsDuplicateKeyViolation(Exception exception)
    {
        for (var current = exception; current is not null; current = current.InnerException)
        {
            if (current is SqlException sqlException)
            {
                foreach (SqlError error in sqlException.Errors)
                {
                    if (error.Number is 2601 or 2627) return true;
                }
            }
        }

        return false;
    }
}
