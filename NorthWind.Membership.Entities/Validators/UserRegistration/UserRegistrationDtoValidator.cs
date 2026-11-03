namespace NorthWind.Membership.Entities.Validators.UserRegistration;
internal class UserRegistrationDtoValidator : AbstractModelValidator<UserRegistrationDto>
{
    public UserRegistrationDtoValidator(IValidationService<UserRegistrationDto> validationService) :
        base(validationService)
    {
        AddRuleFor(u => u.FirstName)
            .StopOnFirstFailure()
            .NotEmpty(UserRegistrationMessages.RequiredFirstNameErrorMessage)
            .Must(name => name.All(c => char.IsLetter(c) || char.IsWhiteSpace(c)),
                UserRegistrationMessages.InvalidFirstNameErrorMessage);
        AddRuleFor(u => u.LastName)
            .StopOnFirstFailure()
            .NotEmpty(UserRegistrationMessages.RequiredLastNameErrorMessage)
            .Must(lastName => lastName.All(c => char.IsLetter(c) || char.IsWhiteSpace(c)),
                UserRegistrationMessages.InvalidLastNameErrorMessage);
        AddRuleFor(u => u.Email)
            .NotEmpty(UserRegistrationMessages.RequiredEmailErrorMessage)
            .EmailAddress(UserRegistrationMessages.InvalidEmailErrorMessage)
            .Must(NorthWind.Membership.Entities.Validators.GmailAddressRules.IsValidUsernameWhenGmail, UserRegistrationMessages.InvalidGmailUsernameErrorMessage);
        AddRuleFor(u => u.Password)
            .StopOnFirstFailure()
            .NotEmpty(UserRegistrationMessages.RequiredPasswordErrorMessage)
            .MinimumLength(6, UserRegistrationMessages.PasswordTooShortErrorMessage)
            .Must(p => p.Any(c => char.IsLower(c)), UserRegistrationMessages.PasswordRequiresLowerErrorMessage)
            .Must(p => p.Any(c => char.IsUpper(c)), UserRegistrationMessages.PasswordRequiresUpperErrorMessage)
            .Must(p => p.Any(c => char.IsDigit(c)), UserRegistrationMessages.PasswordRequiresDigitErrorMessage)
            .Must(p => p.Any(c => !char.IsLetterOrDigit(c)), UserRegistrationMessages.PasswordRequiresNonAlphanumericErrorMessage);
    }
}
