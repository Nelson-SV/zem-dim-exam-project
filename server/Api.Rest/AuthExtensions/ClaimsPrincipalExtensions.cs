using System.Security.Claims;

namespace Api.Rest.AuthExtensions;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal user)
    {
        var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                          ?? user.FindFirst("id")?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }

    public static string GetUserRole(this ClaimsPrincipal user)
    {
        var role = user.FindFirst(ClaimTypes.Role)?.Value
                   ?? user.FindFirst("role")?.Value;

        if (string.IsNullOrEmpty(role))
            throw new UnauthorizedAccessException("User role not found in token");

        return role;
    }
}