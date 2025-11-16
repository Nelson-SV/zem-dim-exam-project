using Application.Models.Dtos._3DScans;

namespace Application.Interfaces.Users._3DScans;

public interface IUser3DScanService
{
    Task<List<User3DScanDto>> GetScansByClientIdAsync(Guid clientId);
}