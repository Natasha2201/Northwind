using Microsoft.AspNetCore.Components;
using NorthWind.Membership.Frontend.RazorViews.ViewModels.UserRegistration;

namespace NorthWind.Membership.Frontend.RazorViews.Components;
public partial class UserRegistrationComponent
{
    [Parameter]
    public UserRegistrationViewModel ViewModel { get; set; }

    protected bool ShowPassword { get; set; }
    protected bool ShowPasswordConfirmation { get; set; }

    protected void TogglePasswordVisibility() => ShowPassword = !ShowPassword;
    protected void TogglePasswordConfirmationVisibility() => ShowPasswordConfirmation = !ShowPasswordConfirmation;
}
