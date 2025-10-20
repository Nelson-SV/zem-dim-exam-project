using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Authentication;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Application.Models.Enums;
using Core.Domain.Entities;
using JWT;
using JWT.Algorithms;
using JWT.Builder;
using JWT.Serializers;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;
namespace Application.Services.Security;

public class SecurityService(IOptionsMonitor<AppOptions> optionsMonitor, IUserRepository repository) : ISecurityService
{
    public AuthResponseDto Login(AuthRequestDto dto)
    {
        var user = repository.GetUserByEmailOrNull(dto.Email) 
                   ?? throw new ValidationException("User email not found");

        VerifyPasswordOrThrow(dto.Password + user.Salt, user.Passwordhash);

        return new AuthResponseDto
        {
            Jwt = GenerateJwtFor(user, dto.Email)
        };
    }

    public AuthResponseDto Register(RegisterRequestDto dto)
    {
        var existing = repository.GetUserByEmailOrNull(dto.Email);
        if (existing is not null) throw new ValidationException("User already exists");

        var salt = GenerateSalt();
        var hash = HashPassword(dto.Password + salt);

        var insertedUser = repository.AddUser(new User
        {
            Id = Guid.NewGuid(),
            Email = dto.Email,
            Firstname = dto.FirstName,
            Lastname = dto.LastName,
            Phonenumber = dto.PhoneNumber,
            Role = Roles.UserRole,
            Isactive = true,
            Profileimageurl = dto.ProfileImageUrl ?? "https://example.com/default-avatar.png",
            Language = dto.Language ?? "en",
            Salt = salt,
            Passwordhash = hash
        });

        return new AuthResponseDto
        {
            Jwt = GenerateJwtFor(insertedUser, insertedUser.Email)
        };
    }

    /// <summary>
    ///     Gives hex representation of SHA512 hash
    /// </summary>
    public string HashPassword(string password)
    {
        using var sha512 = SHA512.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha512.ComputeHash(bytes);
        return BitConverter.ToString(hash).Replace("-", "").ToLowerInvariant();
    }

    public void VerifyPasswordOrThrow(string password, string hashedPassword)
    {
        if (HashPassword(password) != hashedPassword)
            throw new AuthenticationException("Invalid login");
    }

    public string GenerateSalt()
    {
        return Guid.NewGuid().ToString();
    }

    /// <summary>
    ///     Generates a valid JWT token compatible with JwtBearer and SignalR authentication
    /// </summary>
    public string GenerateJwtFor(User user, string email)
    {
        var secret = (optionsMonitor.CurrentValue.JwtSecret ?? string.Empty).Trim();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512); // HS512

        var claims = new List<Claim>
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(ClaimTypes.Role, user.Role)
        };

        var token = new JwtSecurityToken(
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    ///     Validates and decodes a JWT manually (used only if needed)
    /// </summary>
    public Dictionary<string, object> VerifyJwtOrThrow(string jwt)
    {
        var token = new JwtBuilder()
            .WithAlgorithm(new HMACSHA512Algorithm())
            .WithSecret(optionsMonitor.CurrentValue.JwtSecret)
            .WithUrlEncoder(new JwtBase64UrlEncoder())
            .WithJsonSerializer(new JsonNetSerializer())
            .MustVerifySignature()
            .Decode<IDictionary<string, object>>(jwt);

        if (!token.ContainsKey("exp") || 
            DateTimeOffset.FromUnixTimeSeconds(Convert.ToInt64(token["exp"])) < DateTimeOffset.UtcNow)
            throw new AuthenticationException("Token expired");

        return new Dictionary<string, object>(token);
    }
}
