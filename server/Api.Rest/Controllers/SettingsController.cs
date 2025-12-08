using System.Security.Claims;
using Application.Interfaces.Services;
using Application.Models.Dtos.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SettingsController : ControllerBase
{
    private readonly ISettingsService _settingsService;

    public SettingsController(ISettingsService settingsService)
    {
        _settingsService = settingsService;
    }

    // GET: /api/settings/company
    [HttpGet("company")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CompanyDto>> GetCompanyInfo()
    {
        try
        {
            var company = await _settingsService.GetCompanyInfo();
            return Ok(company);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: /api/settings/company
    [HttpPut("company")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<CompanyDto>> UpdateCompanyInfo([FromBody] UpdateCompanyDto dto)
    {
        try
        {
            var company = await _settingsService.UpdateCompanyInfo(dto);
            return Ok(company);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // GET: /api/settings/notifications
    [HttpGet("notifications")]
    public async Task<ActionResult<UserSettingsDto>> GetUserSettings()
    {
        try
        {
            var userId = GetUserId();
            var settings = await _settingsService.GetUserSettings(userId);
            return Ok(settings);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    // PUT: /api/settings/notifications
    [HttpPut("notifications")]
    public async Task<ActionResult<UserSettingsDto>> UpdateUserSettings([FromBody] UpdateUserSettingsDto dto)
    {
        try
        {
            var userId = GetUserId();
            var settings = await _settingsService.UpdateUserSettings(userId, dto);
            return Ok(settings);
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
