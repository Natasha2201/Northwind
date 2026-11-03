
namespace NorthWind.Exceptions.Entities.ExceptionHandlers;

internal class UnauthorizedAccessExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        bool Handled = false;

        if (exception is UnauthorizedAccessException)
        {
            ProblemDetails Details = new()
            {
                Status = StatusCodes.Status401Unauthorized,
                Type = "https://datatracker.ietf.org/doc/html/rfc7235#section-3.1",
                Title = ExceptionMessages.UnauthorizedAccessExceptionTitle,
                Detail = ExceptionMessages.UnauthorizedAccessExceptionDetail,
                Instance = $"{nameof(ProblemDetails)}/{nameof(UnauthorizedAccessException)}"
            };

            await httpContext.WriteProblemDetailsAsync(Details);
            Handled = true;
        }

        return Handled;
    }
}