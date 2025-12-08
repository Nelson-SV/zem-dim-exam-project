using System.Security.Claims;
using Application.Interfaces.Services;
using Application.Models.Dtos.Profile;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProfileController : ControllerBase
{
    private readonly IProfileService _profileService;

    public ProfileController(IProfileService profileService)
    {
        _profileService = profileService;
    }

    // GET: /api/profile
    [HttpGet]
    public async Task<ActionResult<GetProfileResponseDto>> GetProfile()
    {
        try
        {
            var userId = GetUserId();
            var profile = await _profileService.GetProfile(userId);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: /api/profile
    [HttpPut]
    public async Task<ActionResult<GetProfileResponseDto>> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        try
        {
            var userId = GetUserId();
            var profile = await _profileService.UpdateProfile(userId, dto);
            return Ok(profile);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // POST: /api/profile/change-password
    [HttpPost("change-password")]
    public async Task<ActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        try
        {
            var userId = GetUserId();
            await _profileService.ChangePassword(userId, dto);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }
}
