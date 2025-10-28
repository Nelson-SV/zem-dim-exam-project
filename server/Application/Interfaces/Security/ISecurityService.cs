using Application.Models.Dtos.Auth;
using Core.Domain.Entities;

namespace Application.Interfaces.Security;

public interface ISecurityService
{
    string HashPassword(string password);
    void VerifyPasswordOrThrow(string password, string hashedPassword);
    string GenerateSalt();
    
     
    string GenerateJwtFor(User user, string email);
    
    AuthResponseDto Login(AuthRequestDto dto);
    AuthResponseDto Register(RegisterRequestDto dto);
    
    // 🔹 повертає claims у зручному вигляді
    Dictionary<string, object> VerifyJwtOrThrow(string jwt);
}