using System.Security.Authentication;

namespace Api.Rest.AuthExtensions;

public static class JwtExtension
{
    public static string GetJwt(this HttpContext ctx)
    {
        return ctx.Request.Headers["Authorization"].FirstOrDefault() ??
               throw new AuthenticationException("No token provided");
    }
    
    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? User.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }

    private string GetUserRoleFromToken()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value
                   ?? User.FindFirst("role")?.Value;

        if (string.IsNullOrEmpty(role))
            throw new UnauthorizedAccessException("User role not found in token");

        return role;
    }
}