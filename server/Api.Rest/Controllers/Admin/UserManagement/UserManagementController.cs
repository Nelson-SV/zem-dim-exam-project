using Application.Interfaces.Admin.UserManagement;
using Application.Models;
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
    public const string DeleteUserRoute = ControllerRoute + nameof(DeleteUser);
    public const string GetAllUsersRoute = ControllerRoute + nameof(GetAllUsers);
    
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [Route(RegisterUserRoute)]
    public async Task<ActionResult<UsersDetailsDto>> RegisterUser(
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
    public async Task<ActionResult<UsersDetailsDto>> UpdateUser(
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
    
    [HttpDelete]
    [Authorize(Policy = "AdminOnly")]
    [Route(DeleteUserRoute)]
    public async Task<ActionResult<DeleteResponseDto>> DeleteUser([FromQuery] string userId)
    {
        var deleteResponseDto = await userManagementService.SoftDelete(userId); 
        if (!deleteResponseDto.Status)
        {
            return BadRequest(ErrorMessages.GetMessage(ErrorCode.DeletingUserFailed)); 
        }
        
        return Ok(deleteResponseDto);
    }
    
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [Route(GetAllUsersRoute)]
    public async Task<ActionResult<GetAllUsersResponseDto>> GetAllUsers(
        [FromQuery] int page = 1, 
        [FromQuery] int pageSize = 9,
        [FromQuery] string? search = null)
    {
        var response = await userManagementService.GetAllUsers(page, pageSize, search);
        return Ok(response);
    }
}