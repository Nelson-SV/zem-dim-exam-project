using Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserProjects(Guid userId)
    {
        try
        {
            var projects = await _projectService.GetUserProjectsAsync(userId);
            return Ok(projects);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    
    [HttpGet("{projectId}")]
    public async Task<IActionResult> GetProject(Guid projectId)
    {
        try
        {
            var project = await _projectService.GetProjectByIdAsync(projectId);
            if (project == null)
                return NotFound("Project not found");
            
            return Ok(project);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    
    [HttpGet("{projectId}/participants")]
    public async Task<IActionResult> GetProjectParticipants(Guid projectId)
    {
        try
        {
            var participants = await _projectService.GetProjectParticipantsAsync(projectId);
            return Ok(participants);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ex.Message);
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}