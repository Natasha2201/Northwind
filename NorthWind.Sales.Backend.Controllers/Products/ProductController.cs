namespace Microsoft.AspNetCore.Builder;

public static class ProductController
{
    public static WebApplication UseProductController(this WebApplication app)
    {
        app.MapGet("/api/products/available", async (IQueriesRepository repository) =>
        {
            var products = await repository.GetAvailableProductsAsync();
            return Results.Ok(products);
        })
        .RequireAuthorization();

        return app;
    }
}
