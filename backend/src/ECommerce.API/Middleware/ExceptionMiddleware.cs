using System.Net;
using System.Text.Json;
using ECommerce.Application.Common.Exceptions;
using FluentValidation;

namespace ECommerce.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro não tratado: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, errors) = exception switch
        {
            ValidationException ve => (HttpStatusCode.BadRequest, ve.Errors.Select(e => e.ErrorMessage).ToArray()),
            NotFoundException => (HttpStatusCode.NotFound, new[] { exception.Message }),
            ForbiddenAccessException => (HttpStatusCode.Forbidden, new[] { exception.Message }),
            BusinessException => (HttpStatusCode.UnprocessableEntity, new[] { exception.Message }),
            UnauthorizedAccessException => (HttpStatusCode.Unauthorized, new[] { "Não autorizado." }),
            _ => (HttpStatusCode.InternalServerError, new[] { "Ocorreu um erro interno no servidor." })
        };

        context.Response.StatusCode = (int)statusCode;

        var response = new
        {
            statusCode = (int)statusCode,
            errors,
            timestamp = DateTime.UtcNow
        };

        await context.Response.WriteAsync(JsonSerializer.Serialize(response, _jsonOptions));
    }
}