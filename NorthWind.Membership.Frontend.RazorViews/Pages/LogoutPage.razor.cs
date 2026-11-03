using System.Threading.Tasks;
using Microsoft.AspNetCore.Components;
using NorthWind.Membership.Frontend.RazorViews.AuthenticationStateProviders;

namespace NorthWind.Membership.Frontend.RazorViews.Pages;

public partial class LogoutPage
{
    [Inject]
    JWTAuthenticationStateProvider AuthenticationStateProvider { get; set; }

    [Inject]
    NavigationManager NavigationManager { get; set; }

    protected override async Task OnInitializedAsync()
    {
        await CloseSession();
    }

    async ValueTask CloseSession()
    {
        await AuthenticationStateProvider.LogoutAsync();
        NavigationManager.NavigateTo("/", forceLoad: true);
    }
}
