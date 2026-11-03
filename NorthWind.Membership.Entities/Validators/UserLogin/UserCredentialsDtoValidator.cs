namespace NorthWind.Membership.Entities.Validators.UserLogin;
internal class UserCredentialsDtoValidator : AbstractModelValidator<UserCredentialsDto>
{
    public UserCredentialsDtoValidator(IValidationService<UserCredentialsDto> validationService) :
        base(validationService)
    {
        AddRuleFor(u => u.Email)
            .NotEmpty(UserLoginMessages.RequiredEmailErrorMessage)
            .EmailAddress(UserLoginMessages.InvalidEmailErrorMessage)
            .Must(NorthWind.Membership.Entities.Validators.GmailAddressRules.IsValidUsernameWhenGmail, UserLoginMessages.InvalidGmailUsernameErrorMessage);
        AddRuleFor(u => u.Password)
            .NotEmpty(UserLoginMessages.RequiredPasswordErrorMessage);
    }
}
