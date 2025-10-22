using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Admin.UserManagement;

public class AdminUserManagementController(ISecurityService securityService) : ControllerBase
{
    public const string ControllerRoute = "api/admin/";
    public const string RegisterUserRoute = ControllerRoute + nameof(RegisterUser);
    
    //TODO: Validation of the inputs (FluentValidation)
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [Route(RegisterUserRoute)]
    public async Task<ActionResult<RegisterResponseDto>> RegisterUser(
        [FromBody] RegisterRequestDto dto,
        [FromServices] IValidator<RegisterRequestDto> validator)
    {
         var validation = await validator.ValidateAsync(dto);
           if (!validation.IsValid)
               return BadRequest(validation.Errors.Select(e => e.ErrorMessage));
         
        var result = await securityService.RegisterUser(dto);
        return Ok(result);
    }
}