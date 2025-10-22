using System.Security.Claims;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;

namespace Api.Rest.Middleware;

public class JwtUserValidationMiddleware
{
    private readonly RequestDelegate _next;

    public JwtUserValidationMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, IAdminUserManagementRepository adminUserManagementRepository)
    {
        var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier) 
                          ?? context.User?.FindFirst("id"); 

        if (userIdClaim is not null)
        {
            var userId = Guid.Parse(userIdClaim.Value);
            var user = adminUserManagementRepository.GetUserByIdOrNull(userId);

            if (user is null || user.Isactive != true)
            {
                context.Response.StatusCode = StatusCodes.Status401Unauthorized;
                await context.Response.WriteAsJsonAsync(new
                {
                    message = "User inactive or does not exist."
                });
                return;
            }
        }

        await _next(context);
    }
}