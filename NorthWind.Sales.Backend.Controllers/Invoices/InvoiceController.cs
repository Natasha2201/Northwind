using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using NorthWind.Sales.Backend.BusinessObjects.Interfaces.Repositories;
using NorthWind.Sales.Backend.PdfGenerator;

namespace Microsoft.AspNetCore.Builder;

public static class InvoiceController
{
    public static WebApplication UseInvoiceController(this WebApplication app)
    {
        app.MapGet("/api/orders/{id}/invoice", async (
            int id,
            IQueriesRepository repository) =>
        {
            var invoice = await repository.GetInvoiceAsync(id);
            return invoice != null ? Results.Ok(invoice) : Results.NotFound();
        })
        .RequireAuthorization();

        app.MapGet("/api/orders/{id}/invoice/pdf", async (
            int id,
            IQueriesRepository repository,
            InvoicePdfGenerator pdfGenerator) =>
        {
            var invoice = await repository.GetInvoiceAsync(id);
            if (invoice == null) return Results.NotFound();

            var pdfBytes = pdfGenerator.Generate(invoice);
            return Results.File(pdfBytes, "application/pdf", $"Factura-{invoice.InvoiceNumber}.pdf");
        })
        .RequireAuthorization();

        app.MapGet("/api/orders/search", async (
            string? q,
            string? criteria,
            int page,
            int pageSize,
            DateTime? dateFrom,
            DateTime? dateTo,
            IQueriesRepository repository) =>
        {
            var result = await repository.SearchInvoicesAsync(
                q ?? string.Empty, criteria ?? "Todos", page, pageSize, dateFrom, dateTo);
            return Results.Ok(result);
        })
        .RequireAuthorization();

        return app;
    }
}
