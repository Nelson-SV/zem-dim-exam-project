using Application.Models.Dtos.Auth;
using Application.Models.Security;
using Core.Domain.Entities;

namespace Application.Interfaces.Security;

public interface ISecurityService
{
    public string HashPassword(string password);
    public void VerifyPasswordOrThrow(string password, string hashedPassword);
    public string GenerateSalt();
    public string GenerateJwt(JwtClaims claims);
    public AuthResponseDto Login(AuthRequestDto dto);
    Task<AuthResponseDto> RefreshAsync(RefreshRequestDto dto);
    public JwtClaims VerifyJwtOrThrow(string jwt);
    public string GenerateRandomPassword(int length);
    Task<ResetPasswordResponseDto> ResetPasswordAsync(Guid userId, string newPassword);
    Task LogoutAllAsync(Guid userId);

}
