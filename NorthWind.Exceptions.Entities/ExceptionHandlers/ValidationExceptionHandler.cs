namespace NorthWind.Exceptions.Entities.ExceptionHandlers;
internal class ValidationExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        bool Handled = false;
        if (exception is ValidationException Ex)
        {
            ProblemDetails Details = new ProblemDetails();
            Details.Status = StatusCodes.Status400BadRequest;
            Details.Type = "https://datatracker.ietf.org/doc/html/rfc7231#section-6.5.1";
            Details.Title = ExceptionMessages.ValidationExceptionTitle;
            Details.Detail = ExceptionMessages.ValidationExceptionDetail;
            Details.Instance = $"{nameof(ProblemDetails)}/{nameof(ValidationException)}";
            Details.Extensions.Add("errors", Ex.Errors);
            await httpContext.WriteProblemDetailsAsync(Details);
            Handled = true;
        }
        return Handled;
    }
}
