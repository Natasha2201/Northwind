namespace Microsoft.AspNetCore.Builder;

public static class SearchController
{
    public static WebApplication UseSearchController(this WebApplication app)
    {
        app.MapGet("/api/customers/search", async (
            string? q,
            string? criteria,
            int page,
            int pageSize,
            IQueriesRepository repository) =>
        {
            var result = await repository.SearchCustomersAsync(
                q ?? string.Empty, criteria ?? "Todos", page, pageSize);
            return Results.Ok(result);
        })
        .RequireAuthorization();

        app.MapGet("/api/customers/{id}/balance", async (
            string id,
            IQueriesRepository repository) =>
        {
            var balance = await repository.GetCustomerCurrentBalance(id);
            return Results.Ok(new { balance = balance ?? 0, pendingDebt = balance ?? 0, currentBalance = balance ?? 0 });
        })
        .RequireAuthorization();

        app.MapGet("/api/products/search", async (
            string? q,
            string? criteria,
            int page,
            int pageSize,
            IQueriesRepository repository) =>
        {
            var result = await repository.SearchProductsAsync(
                q ?? string.Empty, criteria ?? "Todos", page, pageSize);
            return Results.Ok(result);
        })
        .RequireAuthorization();

        return app;
    }
}
