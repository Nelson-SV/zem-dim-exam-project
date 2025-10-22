using Application.Models.Dtos.Auth;
using Application.Models.Security;

namespace Application.Interfaces.Security;

public interface ISecurityService
{
    public string HashPassword(string password);
    public void VerifyPasswordOrThrow(string password, string hashedPassword);
    public string GenerateSalt();
    public string GenerateJwt(JwtClaims claims);
    public AuthResponseDto Login(AuthRequestDto dto);
    public Task<RegisterResponseDto> RegisterUser(RegisterRequestDto dto);
    public JwtClaims VerifyJwtOrThrow(string jwt);
    public string GenerateRandomPassword(int length);
}