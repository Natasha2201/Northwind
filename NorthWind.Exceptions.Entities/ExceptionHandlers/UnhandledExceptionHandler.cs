namespace NorthWind.Exceptions.Entities.ExceptionHandlers;
internal class UnhandledExceptionHandler(ILogger<UnhandledExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        ProblemDetails Details = new ProblemDetails();
        Details.Status = StatusCodes.Status500InternalServerError;
        Details.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.6.1";
        Details.Title = ExceptionMessages.UnhandledExceptionTitle;
        Details.Detail = ExceptionMessages.UnhandledExceptionDetail;
        Details.Instance = $"{nameof(ProblemDetails)}/{exception.GetType()}";
        logger.LogError(exception, ExceptionMessages.UnhandledExceptionTitle);
        await httpContext.WriteProblemDetailsAsync(Details);
        return true;
    }
}
