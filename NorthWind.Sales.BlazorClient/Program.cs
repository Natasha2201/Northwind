using System.Globalization;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;

CultureInfo.DefaultThreadCurrentCulture = new CultureInfo("en-US");
CultureInfo.DefaultThreadCurrentUICulture = new CultureInfo("en-US");

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<NorthWind.Sales.BlazorClient.App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");
builder.Services.AddNorthWindSalesServices(client =>
{
    client.BaseAddress =
        new Uri(builder.Configuration["WebApiAddress"]);
},
membershipHttpClient =>
{
    membershipHttpClient.BaseAddress =
        new Uri(builder.Configuration["WebApiAddress"]);
},
httpClientBuilder =>
    httpClientBuilder.AddMembershipBearerTokenHandler());
await builder.Build().RunAsync();
