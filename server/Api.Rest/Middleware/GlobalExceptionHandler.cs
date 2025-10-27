using System.ComponentModel.DataAnnotations;
using System.Security.Authentication;
using Common.Responses;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Middleware;

internal sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var traceId = httpContext.TraceIdentifier;
        
        //Determine HTTP status code
        var status = exception switch
        {
            ValidationException => StatusCodes.Status400BadRequest,
            AuthenticationException => StatusCodes.Status401Unauthorized,
            UnauthorizedAccessException => StatusCodes.Status403Forbidden,
            ApplicationException => StatusCodes.Status400BadRequest,
            _ => StatusCodes.Status500InternalServerError
        };
        
        //Logging based on severity
        if (status >= 500)
            logger.LogError(exception, "Server error [{TraceId}]: {Message}", traceId, exception.Message);
        else
            logger.LogWarning(exception, "Client error [{TraceId}]: {Message}", traceId, exception.Message);

        //Prepare structured response
        var errorResponse = new ApiErrorResponse
        {
            Code = exception.GetType().Name,
            Message = exception.Message,
            TraceId = traceId,
            Status = status
        };

        httpContext.Response.StatusCode = status;

        await httpContext.Response
            .WriteAsJsonAsync(errorResponse, cancellationToken);

        return true;
    }
}