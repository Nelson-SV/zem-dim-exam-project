using Application.Interfaces.Infrastructure.Postgres.Users._3DScans;
using Application.Interfaces.Users._3DScans;
using Application.Models.Dtos._3DScans;

namespace Application.Services.Users._3DScans;

public class User3DScanService(IUser3DScanRepository user3DScanRepository) : IUser3DScanService
{
    public async Task<List<User3DScanDto>> GetScansByClientIdAsync(Guid clientId)
    {
        var scans = await user3DScanRepository.GetScansByClientIdAsync(clientId);
        return scans.Select(User3DScanDto.FromEntity).ToList();
    }
}