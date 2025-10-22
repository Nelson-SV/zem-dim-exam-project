using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Admin.UserManagement;

public class AdminUserManagementController(ISecurityService securityService) : ControllerBase
{
    public const string ControllerRoute = "api/admin/";
    public const string RegisterUserRoute = ControllerRoute + nameof(RegisterUser);


    //TODO: Need to check if it's an admin and a logged in user trying to register.
    //TODO: Validation of the inputs (FluentValidation)
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [Route(RegisterUserRoute)]
    public async Task<ActionResult<RegisterResponseDto>> RegisterUser([FromBody] RegisterRequestDto dto)
    {
        var result = await securityService.RegisterUser(dto);
        return Ok(result);
    }
}