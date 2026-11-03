using NorthWind.Membership.Backend.Core.Dtos;
using NorthWind.Membership.Backend.Core.Interfaces.Common;
using NorthWind.Membership.Backend.Core.Interfaces.UserLogin;
using NorthWind.Membership.Backend.Core.Resources;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.Interfaces;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.Membership.Backend.Core.UseCases.UserLogin;
internal class UserLoginInteractor(
    IMembershipService membershipService,
    IUserLoginOutputPort presenter,
    IModelValidatorHub<UserCredentialsDto> validationService)
    : IUserLoginInputPort
{
    public async Task Handle(UserCredentialsDto userData)
    {
        Result<UserDto, IEnumerable<ValidationError>> Result;
        if (!await validationService.Validate(userData))
        {
            Result = new(validationService.Errors);
        }
        else
        {
            var User = await membershipService.GetUserByCredentials(userData);
            if (User == null)
            {
                Result = new([new ValidationError(nameof(userData.Password), UserLoginMessages.InvalidUserCredentialsErrorMessage)]);
            }
            else
            {
                Result = new(User);
            }
        }
        await presenter.Handle(Result);
    }
}
