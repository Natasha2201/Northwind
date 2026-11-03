namespace NorthWind.Sales.Backend.BusinessObjects.ValueObjects;

public class PagedResult<T>(
    IEnumerable<T> items,
    int totalCount,
    int page,
    int pageSize)
{
    public IEnumerable<T> Items => items;
    public int TotalCount => totalCount;
    public int Page => page;
    public int PageSize => pageSize;
    public int TotalPages => (int)Math.Ceiling(totalCount / (double)pageSize);
    public bool HasPrevious => Page > 1;
    public bool HasNext => Page < TotalPages;
}
