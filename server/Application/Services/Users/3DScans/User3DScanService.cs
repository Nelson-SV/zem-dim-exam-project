using Application.Interfaces.Infrastructure.Postgres.Users._3DScans;
using Application.Interfaces.Users._3DScans;
using Application.Models.Dtos._3DScans;

namespace Application.Services.Users._3DScans;

public class User3DScanService(IUser3DScanRepository user3DScanRepository) : IUser3DScanService
{
    public async Task<List<User3DScanProjectDto>> GetScansByClientIdAsync(Guid clientId)
    {
        var projects = await user3DScanRepository.GetScansByClientIdAsync(clientId);

        return projects.Select(p => new User3DScanProjectDto
        {
            ProjectId = p.Id,
            ProjectTitle = p.Title,
            Scans = p.Threedscans
                .OrderByDescending(s => s.Scannedat)
                .Select(s => User3DScanDto.FromEntity(s))
                .ToList(),
            ScanCount = p.Threedscans.Count()
        }).ToList();
    }
}