using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.IdentityModel.JsonWebTokens;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Frontend.RazorViews.Interfaces;

namespace NorthWind.Membership.Frontend.RazorViews.AuthenticationStateProviders;
public class JWTAuthenticationStateProvider(ITokenStorage storage) : AuthenticationStateProvider
{
    public override async Task<AuthenticationState> GetAuthenticationStateAsync()
    {
        ClaimsIdentity Identity = new ClaimsIdentity();
        try
        {
            var Tokens = await storage.GetTokensAsync();
            if (Tokens != null && !string.IsNullOrWhiteSpace(Tokens.AccessToken))
            {
                var Handler = new JsonWebTokenHandler();
                var Token = Handler.ReadJsonWebToken(Tokens.AccessToken);
                Identity = new ClaimsIdentity(Token.Claims, nameof(JWTAuthenticationStateProvider));
            }
        }
        catch
        {
            // Token inválido o expirado — retornar como no autenticado
            Identity = new ClaimsIdentity();
        }
        return new AuthenticationState(new ClaimsPrincipal(Identity));
    }
    public async ValueTask LoginAsync(TokensDto tokens)
    {
        await storage.StoreTokensAsync(tokens);
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }
    public async ValueTask LogoutAsync()
    {
        await storage.RemoveTokensAsync();
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }
}
