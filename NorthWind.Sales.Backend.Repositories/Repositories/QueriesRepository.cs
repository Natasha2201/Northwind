using System.Globalization;
using System.Text;
using Microsoft.EntityFrameworkCore;

namespace NorthWind.Sales.Backend.Repositories.Repositories;
internal class QueriesRepository(INorthWindSalesQueriesDataContext context) : IQueriesRepository
{
    private const string SearchCollation = "Latin1_General_100_CI_AI";

    private static string NormalizeSearchTerm(string? value)
    {
        var decomposed = (value ?? string.Empty).Trim().Normalize(NormalizationForm.FormD);
        var withoutDiacritics = new string(decomposed
            .Where(character => CharUnicodeInfo.GetUnicodeCategory(character) != UnicodeCategory.NonSpacingMark)
            .ToArray());
        return withoutDiacritics.Normalize(NormalizationForm.FormC).ToLowerInvariant();
    }

    public async Task<decimal?> GetCustomerCurrentBalance(string customerId)
    {
        var Queryable = context.Customers
            .Where(c => c.Id == customerId || c.Identification == customerId)
            .Select(c => new { c.CurrentBalance });
        var Result = await context.FirstOrDefaultAync(Queryable);
        return Result?.CurrentBalance;
    }
    public async Task<IEnumerable<ProductUnitsInStock>> GetProductsUnitsInStock(IEnumerable<int> productIds)
    {
        var Queryable = context.Products
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new ProductUnitsInStock(p.Id, p.UnitsInStock));
        return await context.ToListAsync(Queryable);
    }

    public async Task<IEnumerable<ProductDto>> GetAvailableProductsAsync()
    {
        var queryable = context.Products
            .Where(p => p.UnitsInStock > 0)
            .Select(p => new ProductDto(p.Id, p.Name, p.UnitPrice, p.UnitsInStock));

        return await context.ToListAsync(queryable);
    }

    public async Task<PagedResult<CustomerSearchDto>> SearchCustomersAsync(
        string searchTerm, string searchCriteria, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;

        var queryable = context.Customers.AsQueryable();
        var normalizedSearchTerm = NormalizeSearchTerm(searchTerm);
        var criteria = NormalizeSearchTerm(searchCriteria);

        if (!string.IsNullOrWhiteSpace(normalizedSearchTerm))
        {
            switch (criteria)
            {
                case "cedula":
                case "cédula":
                case "identification":
                    queryable = queryable.Where(c => EF.Functions.Collate(c.Identification.Trim(), SearchCollation).StartsWith(normalizedSearchTerm));
                    break;
                case "nombre":
                case "firstname":
                case "name":
                    queryable = queryable.Where(c => EF.Functions.Collate(c.FirstName.Trim(), SearchCollation).StartsWith(normalizedSearchTerm));
                    break;
                case "apellido":
                case "lastname":
                    queryable = queryable.Where(c => EF.Functions.Collate(c.LastName.Trim(), SearchCollation).StartsWith(normalizedSearchTerm));
                    break;
                default: // "todos"
                    queryable = queryable.Where(c =>
                        EF.Functions.Collate(c.Identification.Trim(), SearchCollation).StartsWith(normalizedSearchTerm) ||
                        EF.Functions.Collate(c.FirstName.Trim(), SearchCollation).StartsWith(normalizedSearchTerm) ||
                        EF.Functions.Collate(c.LastName.Trim(), SearchCollation).StartsWith(normalizedSearchTerm));
                    break;
            }
        }

        // Count filtered records before pagination so UI receives correct page metadata.
        var totalCount = await context.CountAsync(queryable);

        var items = queryable
            .OrderBy(c => c.LastName)
            .ThenBy(c => c.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(c => new CustomerSearchDto(
                c.Id, c.Identification, c.FirstName, c.LastName, c.Email, c.Address));

        var result = await context.ToListAsync(items);

        return new PagedResult<CustomerSearchDto>(result, totalCount, page, pageSize);
    }

    public async Task<PagedResult<ProductSearchDto>> SearchProductsAsync(
        string searchTerm, string searchCriteria, int page, int pageSize)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;

        var queryable = context.Products.Where(p => p.UnitsInStock > 0);
        var normalizedSearchTerm = NormalizeSearchTerm(searchTerm);

        if (!string.IsNullOrWhiteSpace(normalizedSearchTerm))
        {
            var criteria = NormalizeSearchTerm(searchCriteria);
            if (int.TryParse(normalizedSearchTerm, out _))
            {
                switch (criteria)
                {
                    case "id":
                        queryable = queryable.Where(p => p.Id.ToString().StartsWith(normalizedSearchTerm));
                        break;
                    case "name":
                    case "nombre":
                        queryable = queryable.Where(p => EF.Functions.Collate(p.Name, SearchCollation).StartsWith(normalizedSearchTerm));
                        break;
                    default: // "todos"
                        queryable = queryable.Where(p =>
                            EF.Functions.Collate(p.Name, SearchCollation).StartsWith(normalizedSearchTerm) ||
                            p.Id.ToString().StartsWith(normalizedSearchTerm));
                        break;
                }
            }
            else
            {
                switch (criteria)
                {
                    case "id":
                        queryable = queryable.Where(p => p.Id.ToString().StartsWith(normalizedSearchTerm));
                        break;
                    case "name":
                    case "nombre":
                        queryable = queryable.Where(p => EF.Functions.Collate(p.Name, SearchCollation).StartsWith(normalizedSearchTerm));
                        break;
                    default: // "todos"
                        queryable = queryable.Where(p => EF.Functions.Collate(p.Name, SearchCollation).StartsWith(normalizedSearchTerm));
                        break;
                }
            }
        }

        var totalCount = await context.CountAsync(queryable);

        var items = queryable
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductSearchDto(
                p.Id, p.Name, p.UnitPrice, p.UnitsInStock));

        var result = await context.ToListAsync(items);

        return new PagedResult<ProductSearchDto>(result, totalCount, page, pageSize);
    }

    public async Task<InvoiceDto?> GetInvoiceAsync(int orderId)
    {
        var orderQuery = context.Orders
            .Where(o => o.Id == orderId)
            .Select(o => new
            {
                o.Id,
                o.InvoiceNumber,
                o.OrderDate,
                o.CustomerId,
                o.ShipAddress,
                o.ShipCity,
                o.ShipCountry,
                o.ShipPostalCode,
                o.Subtotal,
                o.Tax,
                o.Total
            });

        var order = await context.FirstOrDefaultAsync(orderQuery);
        if (order == null) return null;

        var customerQuery = context.Customers
            .Where(c => c.Id == order.CustomerId)
            .Select(c => new { c.FirstName, c.LastName, c.Identification, c.Address });

        var customer = await context.FirstOrDefaultAsync(customerQuery);

        var detailsQuery = context.OrderDetails
            .Where(d => d.OrderId == orderId)
            .Join(context.Products,
                d => d.ProductId,
                p => p.Id,
                (d, p) => new InvoiceDetailDto(
                    d.ProductId, p.Name, d.UnitPrice, d.Quantity));

        var details = await context.ToListAsync(detailsQuery);

        return new InvoiceDto(
            order.Id,
            order.InvoiceNumber,
            order.OrderDate,
            order.CustomerId,
            $"{customer?.FirstName} {customer?.LastName}".Trim(),
            customer?.Identification ?? string.Empty,
            customer?.Address ?? string.Empty,
            order.ShipAddress,
            order.ShipCity,
            order.ShipCountry,
            order.ShipPostalCode,
            order.Subtotal,
            order.Tax,
            order.Total,
            details);
    }

    public async Task<PagedResult<InvoiceSearchDto>> SearchInvoicesAsync(
        string searchTerm, string searchCriteria, int page, int pageSize,
        DateTime? dateFrom = null, DateTime? dateTo = null)
    {
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;

        var queryable = context.Orders.AsQueryable();
        if (dateFrom.HasValue)
        {
            var from = dateFrom.Value.Date;
            queryable = queryable.Where(o => o.OrderDate >= from);
        }

        if (dateTo.HasValue)
        {
            var toExclusive = dateTo.Value.Date.AddDays(1);
            queryable = queryable.Where(o => o.OrderDate < toExclusive);
        }

        var normalizedSearchTerm = NormalizeSearchTerm(searchTerm);

        if (!string.IsNullOrWhiteSpace(normalizedSearchTerm))
        {
            var criteria = NormalizeSearchTerm(searchCriteria);
            switch (criteria)
            {
                case "factura":
                case "invoice":
                case "invoicenumber":
                    queryable = queryable.Where(o =>
                        EF.Functions.Collate(o.InvoiceNumber, SearchCollation).StartsWith(normalizedSearchTerm) ||
                        o.Id.ToString().StartsWith(normalizedSearchTerm));
                    break;
                case "nombre":
                case "firstname":
                case "name":
                    queryable = queryable.Where(o =>
                        context.Customers.Any(c => c.Id == o.CustomerId && EF.Functions.Collate(c.FirstName, SearchCollation).StartsWith(normalizedSearchTerm)));
                    break;
                case "apellido":
                case "lastname":
                    queryable = queryable.Where(o =>
                        context.Customers.Any(c => c.Id == o.CustomerId && EF.Functions.Collate(c.LastName, SearchCollation).StartsWith(normalizedSearchTerm)));
                    break;
                default: // "todos"
                    // All generated invoice numbers begin with "FAC-". Avoid letting a
                    // one-letter name search such as "f" match every invoice number.
                    var searchInvoiceNumber = normalizedSearchTerm.StartsWith("fac", StringComparison.Ordinal) ||
                                              normalizedSearchTerm.Any(char.IsDigit);
                    queryable = queryable.Where(o =>
                        (searchInvoiceNumber &&
                            (EF.Functions.Collate(o.InvoiceNumber.Replace("-", string.Empty), SearchCollation).StartsWith(normalizedSearchTerm) ||
                             o.Id.ToString().StartsWith(normalizedSearchTerm))) ||
                        context.Customers.Any(c => c.Id == o.CustomerId &&
                            (EF.Functions.Collate(c.FirstName, SearchCollation).StartsWith(normalizedSearchTerm) ||
                             EF.Functions.Collate(c.LastName, SearchCollation).StartsWith(normalizedSearchTerm))));
                    break;
            }
        }

        var totalCount = await context.CountAsync(queryable);

        var items = queryable
            .OrderByDescending(o => o.OrderDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.Id,
                o.InvoiceNumber,
                o.OrderDate,
                o.CustomerId,
                o.Total,
                Customer = context.Customers.FirstOrDefault(c => c.Id == o.CustomerId)
            })
            .Select(o => new InvoiceSearchDto(
                o.Id,
                o.InvoiceNumber,
                o.OrderDate,
                o.CustomerId,
                o.Customer != null ? o.Customer.FirstName : o.CustomerId,
                o.Customer != null ? o.Customer.LastName : string.Empty,
                o.Customer != null ? o.Customer.Identification : string.Empty,
                o.Total));

        var result = await context.ToListAsync(items);

        return new PagedResult<InvoiceSearchDto>(result, totalCount, page, pageSize);
    }
}
