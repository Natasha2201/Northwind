using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using NorthWind.Membership.Frontend.RazorViews.Interfaces;

namespace NorthWind.Membership.Frontend.RazorViews.HttpMessageHandlers;
internal class MembershipBearerTokenHandler(ITokenStorage storage) : DelegatingHandler
{
    protected async override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var Tokens = await storage.GetTokensAsync();
        if (Tokens != null)
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", Tokens.AccessToken);
        }
        return await base.SendAsync(request, cancellationToken);
    }
}
