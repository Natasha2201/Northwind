using System.Text.Json;
using Microsoft.JSInterop;
using NorthWind.Membership.Entities.Dtos.UserLogin;
using NorthWind.Membership.Frontend.RazorViews.Interfaces;

namespace NorthWind.Membership.Frontend.RazorViews.Services;
internal class TokenLocalStorage(IJSRuntime jsRuntime) : ITokenStorage
{
    const string StorageKey = "tokens";
    const string StoreIdentifier = "localStorage.setItem";
    const string GetIdentifier = "localStorage.getItem";
    const string RemoveIdentifier = "localStorage.removeItem";

    public async Task StoreTokensAsync(TokensDto tokens)
    {
        string Value = JsonSerializer.Serialize(tokens);
        await jsRuntime.InvokeVoidAsync(StoreIdentifier, StorageKey, Value);
    }
    public async Task<TokensDto> GetTokensAsync()
    {
        string Value = await jsRuntime.InvokeAsync<string>(GetIdentifier, StorageKey);
        return Value == null ? null : JsonSerializer.Deserialize<TokensDto>(Value);
    }
    public async Task RemoveTokensAsync()
    {
        await jsRuntime.InvokeVoidAsync(RemoveIdentifier, StorageKey);
    }
}
