using Application.Models.Dtos.Dashboard;

namespace Application.Interfaces.Services;

public interface IClientDashboardService
{
    /// <summary>
    /// Returns dashboard data for the requesting user (or admin) with optional project filter.
    /// </summary>
    /// <param name="requesterId">User id from JWT.</param>
    /// <param name="requesterRole">Role from JWT (admin/client).</param>
    /// <param name="projectId">Optional project filter; when provided access is validated.</param>
    /// <param name="latestUpdatesLimit">Max updates to include per project.</param>
    /// <param name="ct">Cancellation token.</param>
    Task<ClientDashboardResponseDto> GetDashboardAsync(
        Guid requesterId,
        string requesterRole,
        Guid? projectId,
        int latestUpdatesLimit = 5,
        CancellationToken ct = default);
}
