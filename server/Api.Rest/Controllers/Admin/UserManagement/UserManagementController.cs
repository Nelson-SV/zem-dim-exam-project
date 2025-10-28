using Application.Interfaces.Admin.UserManagement;
using Application.Models.Dtos.UserManagement;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers.Admin.UserManagement;

public class UserManagementController(IUserManagementService userManagementService, ILogger<UserManagementController> logger) : ControllerBase
{
    public const string ControllerRoute = "api/admin/usermanagement/";
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
             logger.LogWarning("Validation failed for user with email {Email}: {@Errors}", dto.Email, validation.Errors);
             return BadRequest(validation.Errors.Select(e => e.ErrorMessage)); 
         } 
         var result = await userManagementService.RegisterUser(dto); 
         return Ok(result);
    }
    
    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    [Route(UpdateUserRoute)]
    public async Task<ActionResult<UpdateResponseDto>> UpdateUser(
        [FromBody] UpdateRequestDto dto,
        [FromServices] IValidator<UpdateRequestDto> validator)
    {
        var validation = await validator.ValidateAsync(dto);
        if (!validation.IsValid)
        {
            logger.LogWarning("Validation failed for user with email {Email}: {@Errors}", dto.Email, validation.Errors);
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage)); 
        } 
        var result = await userManagementService.UpdateUser(dto); 
        return Ok(result);
    }
}