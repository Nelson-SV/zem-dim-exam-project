using Application.Models.Dtos.Dashboard;

namespace Application.Interfaces.Services;

public interface IClientDashboardService
{
    /// <summary>
    /// Returns dashboard data for the requesting user with optional project filter.
    /// </summary>
    /// <param name="userId">User id from JWT.</param>
    /// <param name="projectId">Optional project filter; when provided access is validated.</param>
    /// <param name="latestUpdatesLimit">Max updates to include per project.</param>
    Task<ClientDashboardResponseDto> GetDashboardAsync(
        Guid userId,
        Guid? projectId,
        int latestUpdatesLimit = 5);
}
