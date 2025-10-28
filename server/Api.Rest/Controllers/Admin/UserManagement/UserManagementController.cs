using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Application.Models.Dtos.UserManagement;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Admin.UserManagement;

public class AdminUserManagementController(ISecurityService securityService, ILogger<AdminUserManagementController> logger) : ControllerBase
{
    public const string ControllerRoute = "api/admin/";
    public const string RegisterUserRoute = ControllerRoute + nameof(RegisterUser);
    public const string UpdateUserRoute = ControllerRoute + nameof(UpdateUser);
    
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [Route(RegisterUserRoute)]
    public async Task<ActionResult<RegisterResponseDto>> RegisterUser(
        [FromBody] RegisterRequestDto dto,
        [FromServices] IValidator<RegisterRequestDto> validator)
    {
         var validation = await validator.ValidateAsync(dto);
         if (!validation.IsValid)
         {
             logger.LogWarning("Validation failed for email {Email}: {@Errors}", dto.Email, validation.Errors);
             return BadRequest(validation.Errors.Select(e => e.ErrorMessage)); 
         } 
         var result = await securityService.RegisterUser(dto); 
         return Ok(result);
    }
    
    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    [Route(UpdateUserRoute)]
    public async Task<ActionResult<RegisterResponseDto>> UpdateUser(
        [FromBody] UpdateRequestDto dto,
        [FromServices] IValidator<UpdateRequestDto> validator)
    {
        var validation = await validator.ValidateAsync(dto);
        if (!validation.IsValid)
        {
            logger.LogWarning("Validation failed for email {Email}: {@Errors}", dto.Email, validation.Errors);
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage)); 
        } 
        var result = await securityService.RegisterUser(dto); 
        return Ok(result);
    }
}