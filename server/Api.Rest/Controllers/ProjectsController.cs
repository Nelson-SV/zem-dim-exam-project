using System.Security.Claims;
using Api.Rest.AuthExtensions;
using Application.Interfaces.Services;
using Application.Models.Dtos.Common;
using Application.Models.Dtos.Project;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.JsonWebTokens;

namespace Api.Rest.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly ILogger<ProjectsController> _logger;

    public const string ControllerRoute = "api/admin/projects/";
    public const string GetAllProjectsList = ControllerRoute + nameof(GetAllProjects);
    public const string Search = ControllerRoute + nameof(SearchProjects);
    public const string Create = ControllerRoute + nameof(CreateProject);
    public const string GetUser = ControllerRoute + nameof(GetUserProjects);
    public const string GetOnlyProject = ControllerRoute + nameof(GetProject);
    
    public const string ProjectParticipants = ControllerRoute + nameof(GetProjectParticipants);
    public const string Update = ControllerRoute + nameof(UpdateProject);
    public const string Patch = ControllerRoute + nameof(PatchProject);
    public const string SoftDelete = ControllerRoute + nameof(DeleteProject);

    public ProjectsController(IProjectService projectService, ILogger<ProjectsController> logger)
    {
        _projectService = projectService;
        _logger = logger;
    }

    #region READ Operations

    /// <summary>
    /// Get all projects (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [Route(GetAllProjectsList)]
    public async Task<ActionResult<List<ProjectDto>>> GetAllProjects()
    {
        try
        {
            var projects = await _projectService.GetAllProjectsAsync();
            return Ok(projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all projects");
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get projects with pagination, search and status filter (Admin)
    /// </summary>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    [Route(Search)]
    public async Task<ActionResult<PaginationItemsResponse<ProjectDto>>> SearchProjects(
        [FromQuery(Name = "q")] string? search,
        [FromQuery] string? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        try
        {
            var result = await _projectService.GetPagedAsync(search, status, page, pageSize);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching projects");
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get projects for specific user
    /// </summary>
    [HttpGet]
    [Route(GetUser)]
    public async Task<ActionResult<List<ProjectDto>>> GetUserProjects(Guid userId)
    {
        try
        {
            var currentUserId = User.GetUserId();
            var currentUserRole = User.GetUserRole();

            // Admin can view any user's projects
            // Client can only view their own projects
            if (!currentUserRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) 
                && currentUserId != userId)
            {
                _logger.LogWarning("User {CurrentUserId} attempted to access projects of user {UserId}", 
                    currentUserId, userId);
                return Forbid();
            }

            var projects = await _projectService.GetUserProjectsAsync(userId);
            return Ok(projects);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting projects for user {UserId}", userId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get single project by ID
    /// </summary>
    [HttpGet]
    [Route(GetOnlyProject)]
    public async Task<ActionResult<ProjectDto>> GetProject(Guid projectId)
    {
        try
        {
            var userId = User.GetUserId();
            var userRole = User.GetUserRole();

            var project = await _projectService.GetProjectByIdAsync(projectId);
            if (project == null)
                return NotFound(new { error = "Project not found" });

            // Check access: Admin can see all, Client can only see their own
            if (!userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase) 
                && project.ClientId != userId)
            {
                return Forbid();
            }

            return Ok(project);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get project participants
    /// </summary>
    [HttpGet]
    [Route(ProjectParticipants)]
    public async Task<ActionResult<ProjectParticipantsDto>> GetProjectParticipants(Guid projectId)
    {
        try
        {
            var participants = await _projectService.GetProjectParticipantsAsync(projectId);
            return Ok(participants);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting participants for project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    #endregion

    #region CREATE Operations

    /// <summary>
    /// Create new project (Admin only)
    /// </summary>
    [HttpPost]
    [Route(Create)]
    [ProducesResponseType(typeof(ProjectDto), 201)]  // ⬅️ Make sure this stays!
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var createdProject = await _projectService.CreateProjectAsync(dto);
            
            return CreatedAtAction(
                nameof(GetProject), 
                new { projectId = createdProject.Id }, 
                createdProject);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating project");
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    #endregion

    #region UPDATE Operations

    /// <summary>
    /// Full update of project (Admin only)
    /// </summary>
    [HttpPut]
    [Authorize(Policy = "AdminOnly")]
    [Route(Update)]
    public async Task<ActionResult<ProjectDto>> UpdateProject(Guid projectId, [FromBody] UpdateProjectDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedProject = await _projectService.UpdateProjectAsync(projectId, dto);
            return Ok(updatedProject);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Partial update of project (Admin only)
    /// </summary>
    [HttpPatch]
    [Authorize(Policy = "AdminOnly")]
    [Route(Patch)]
    public async Task<ActionResult<ProjectDto>> PatchProject(Guid projectId, [FromBody] PatchProjectDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedProject = await _projectService.PatchProjectAsync(projectId, dto);
            return Ok(updatedProject);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error patching project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    #endregion

    #region DELETE Operations

    /// <summary>
    /// Soft delete project (Admin only)
    /// </summary>
    [HttpDelete]
    [Authorize(Policy = "AdminOnly")]
    [Route(SoftDelete)]
    public async Task<ActionResult<object>> DeleteProject(Guid projectId)
    {
        try
        {
            var result = await _projectService.SoftDeleteProjectAsync(projectId);
            if (!result)
                return NotFound(new { error = "Project not found" });

            return Ok(new { message = "Project deleted successfully", projectId });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    #endregion
}
