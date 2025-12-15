using System.Security.Claims;
using Api.Rest.AuthExtensions;
using Application.Interfaces.Security;
using Application.Models;
using Application.Models.Dtos.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.IdentityModel.Tokens.Jwt;

namespace Api.Rest.Controllers.Auth;

public class AuthController(ISecurityService securityService) : ControllerBase
{
    public const string ControllerRoute = "api/auth/";
    public const string LoginRoute = ControllerRoute + nameof(Login);
    public const string SecuredRoute = ControllerRoute + nameof(Secured);
    public const string ResetPasswordRoute = ControllerRoute + nameof(ResetPassword);



    [HttpPost]
    [Route(LoginRoute)]
    public ActionResult<AuthResponseDto> Login([FromBody] AuthRequestDto dto)
    {
        return Ok(securityService.Login(dto));
    }

    [HttpGet]
    [Route(SecuredRoute)]
    public ActionResult Secured()
    {
        securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
        return Ok("You are authorized to see this message");
    }
    
    [HttpPost]
    [Authorize(Policy = "ClientOnly")]
    [Route(ResetPasswordRoute)]
    public async Task<ActionResult<ResetPasswordResponseDto>> ResetPassword([FromBody] ResetPasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var resetPasswordResponseDto = await securityService.ResetPasswordAsync(Guid.Parse(userId), dto.password);
        
        if (!resetPasswordResponseDto.Status)
        {
            return BadRequest(ErrorMessages.GetMessage(ErrorCode.ResetPasswordFailed)); 
        }
        
        return Ok(resetPasswordResponseDto);
    }
}