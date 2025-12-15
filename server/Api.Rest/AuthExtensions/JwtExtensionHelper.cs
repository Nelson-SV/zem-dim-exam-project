using System.Security.Authentication;

namespace Api.Rest.AuthExtensions;

public static class JwtExtensionHelper
{
    public static string GetJwt(this HttpContext ctx)
    {
        return ctx.Request.Headers["Authorization"].FirstOrDefault() ??
               throw new AuthenticationException("No token provided");
    }
}