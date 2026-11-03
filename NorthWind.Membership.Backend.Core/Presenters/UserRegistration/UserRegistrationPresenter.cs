using Microsoft.AspNetCore.Http;
using NorthWind.Membership.Backend.Core.Extensions;
using NorthWind.Membership.Backend.Core.Interfaces.UserRegistration;
using NorthWind.Membership.Backend.Core.Resources;
using NorthWind.Membership.Entities.Dtos.UserRegistration;
using NorthWind.Result.Entities;
using NorthWind.Validation.Entities.ValueObjects;

namespace NorthWind.Membership.Backend.Core.Presenters.UserRegistration;
internal class UserRegistrationPresenter : IUserRegistrationOutputPort
{
    public IResult Result { get; private set; }
    public Task Handle(Result<IEnumerable<ValidationError>> userRegistrationResult)
    {
        userRegistrationResult.HandleResult(
            errors =>
            {
                var duplicateEmail = errors.FirstOrDefault(error =>
                    error.PropertyName == nameof(UserRegistrationDto.Email) &&
                    error.Message == UserRegistrationMessages.DuplicateEmail);

                Result = duplicateEmail is not null
                    ? Results.Conflict(new { message = duplicateEmail.Message })
                    : Results.Problem(errors.ToProblemDetails(
                        UserRegistrationMessages.UserRegistrationErrorTitle,
                        UserRegistrationMessages.UserRegistrationErrorDetail,
                        nameof(UserRegistrationPresenter)));
            },
            () => Result = Results.Ok());
        return Task.CompletedTask;
    }
}
