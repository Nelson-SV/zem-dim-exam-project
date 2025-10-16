using Api.Rest.AuthExtensions;
using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

public class AuthController(ISecurityService securityService) : ControllerBase
{
    public const string ControllerRoute = "api/auth/";
    public const string LoginRoute = ControllerRoute + nameof(Login);
    public const string RegisterRoute = ControllerRoute + nameof(Register);
    public const string SecuredRoute = ControllerRoute + nameof(Secured);


    [HttpPost]
    [Route(LoginRoute)]
    public ActionResult<AuthResponseDto> Login([FromBody] AuthRequestDto dto)
    {
        return Ok(securityService.Login(dto));
    }

    [HttpPost]
    [Route(RegisterRoute)]
    public ActionResult<AuthResponseDto> Register([FromBody] RegisterRequestDto dto)
    {
        return Ok(securityService.Register(dto));
    }

    [HttpGet]
    [Route(SecuredRoute)]
    public ActionResult Secured()
    {
        securityService.VerifyJwtOrThrow(HttpContext.GetJwt());
        return Ok("You are authorized to see this message");
    }
}