using System.Security.Claims;
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
    public const string GetMy = ControllerRoute + nameof(GetMyProjects);
    public const string GetUser = ControllerRoute + nameof(GetUserProjects);
    public const string GetOnlyProject = ControllerRoute + nameof(GetProject);
    
    public const string ProjectParticipants = ControllerRoute + nameof(GetProjectParticipants);
    public const string Update = ControllerRoute + nameof(UpdateProject);
    public const string Patch = ControllerRoute + nameof(PatchProject);
    public const string UpdateStatus = ControllerRoute + nameof(UpdateProjectStatus);
    public const string UpdateProgress = ControllerRoute + nameof(UpdateProjectProgress);
    public const string SoftDelete = ControllerRoute + nameof(DeleteProject);
    public const string Restore = ControllerRoute + nameof(RestoreProject);
    public const string PermanentDelete = ControllerRoute + nameof(PermanentDeleteProject);

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
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        try
        {
            var result = await _projectService.GetPagedAsync(search, status, page, pageSize, ct);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching projects");
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Get my projects (uses JWT token to determine user)
    /// Admin → all projects
    /// Client → only their projects
    /// </summary>
    [HttpGet]
    [Route(GetMy)]
    public async Task<ActionResult<List<ProjectDto>>> GetMyProjects()
    {
        try
        {
            var userId = GetUserIdFromToken();
            var userRole = GetUserRoleFromToken();

            List<ProjectDto> projects;

            if (userRole.Equals("Admin", StringComparison.OrdinalIgnoreCase))
            {
                projects = await _projectService.GetAllProjectsAsync();
            }
            else
            {
                projects = await _projectService.GetUserProjectsAsync(userId);
            }

            return Ok(projects);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting my projects");
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
            var currentUserId = GetUserIdFromToken();
            var currentUserRole = GetUserRoleFromToken();

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
            var userId = GetUserIdFromToken();
            var userRole = GetUserRoleFromToken();

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

    /// <summary>
    /// Update only project status (Admin only)
    /// </summary>
    [HttpPatch]
    [Authorize(Policy = "AdminOnly")]
    [Route(UpdateStatus)]
    public async Task<ActionResult<ProjectDto>> UpdateProjectStatus(Guid projectId, [FromBody] UpdateProjectStatusDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedProject = await _projectService.UpdateProjectStatusAsync(projectId, dto.Status);
            return Ok(updatedProject);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Update only project progress (Admin only)
    /// </summary>
    [HttpPatch]
    [Authorize(Policy = "AdminOnly")]
    [Route(UpdateProgress)]
    public async Task<ActionResult<ProjectDto>> UpdateProjectProgress(Guid projectId, [FromBody] UpdateProjectProgressDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updatedProject = await _projectService.UpdateProjectProgressAsync(projectId, dto.ProgressPercentage);
            return Ok(updatedProject);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating progress for project {ProjectId}", projectId);
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

    /// <summary>
    /// Restore soft-deleted project (Admin only)
    /// </summary>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    [Route(Restore)]
    public async Task<ActionResult<object>> RestoreProject(Guid projectId)
    {
        try
        {
            var result = await _projectService.RestoreProjectAsync(projectId);
            if (!result)
                return NotFound(new { error = "Project not found" });

            return Ok(new { message = "Project restored successfully", projectId });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error restoring project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    /// <summary>
    /// Permanent delete project (Admin only)
    /// </summary>
    [HttpDelete]
    [Authorize(Policy = "AdminOnly")]
    [Route(PermanentDelete)]
    public async Task<ActionResult<object>> PermanentDeleteProject(Guid projectId)
    {
        try
        {
            var result = await _projectService.PermanentDeleteProjectAsync(projectId);
            if (!result)
                return NotFound(new { error = "Project not found" });

            return Ok(new { message = "Project permanently deleted", projectId });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error permanently deleting project {ProjectId}", projectId);
            return StatusCode(500, new { error = $"Internal server error: {ex.Message}" });
        }
    }

    #endregion

    #region Helper Methods

    private Guid GetUserIdFromToken()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                          ?? User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
            throw new UnauthorizedAccessException("User ID not found in token");

        return Guid.Parse(userIdClaim);
    }

    private string GetUserRoleFromToken()
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrEmpty(roleClaim))
            throw new UnauthorizedAccessException("User role not found in token");

        return roleClaim;
    }

    #endregion
}
