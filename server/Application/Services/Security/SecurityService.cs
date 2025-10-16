using System.ComponentModel.DataAnnotations;
using System.Security.Authentication;
using System.Security.Cryptography;
using System.Text;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Application.Models.Enums;
using Application.Models.Security;
using Core.Domain.Entities;
using JWT;
using JWT.Algorithms;
using JWT.Builder;
using JWT.Serializers;
using Microsoft.Extensions.Options;

namespace Application.Services.Security;

public class SecurityService(IOptionsMonitor<AppOptions> optionsMonitor, IUserRepository repository) : ISecurityService
{
    public AuthResponseDto Login(AuthRequestDto dto)
    {
        var user = repository.GetUserByEmailOrNull(dto.Email) ?? throw new ValidationException("User email not found");
        VerifyPasswordOrThrow(dto.Password + user.Salt, user.Passwordhash);
        return new AuthResponseDto
        {
            Jwt = GenerateJwt(new JwtClaims
            {
                Id = user.Id.ToString(),
                Role = user.Role,
                Exp = DateTimeOffset.UtcNow.AddHours(1000)
                    .ToUnixTimeSeconds()
                    .ToString(),
                Email = dto.Email
            })
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
            Jwt = GenerateJwt(new JwtClaims
            {
                Id = insertedUser.Id.ToString(),
                Role = insertedUser.Role,
                Exp = DateTimeOffset.UtcNow.AddHours(1000).ToUnixTimeSeconds().ToString(),
                Email = insertedUser.Email
            })
        };
    }

    /// <summary>
    ///     Gives hex representation of SHA512 hash
    /// </summary>
    /// <param name="password"></param>
    /// <returns></returns>
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

    public string GenerateJwt(JwtClaims claims)
    {
        var tokenBuilder = new JwtBuilder()
            .WithAlgorithm(new HMACSHA512Algorithm())
            .WithSecret(optionsMonitor.CurrentValue.JwtSecret)
            .WithUrlEncoder(new JwtBase64UrlEncoder())
            .WithJsonSerializer(new JsonNetSerializer());

        foreach (var claim in claims.GetType().GetProperties())
            tokenBuilder.AddClaim(claim.Name, claim.GetValue(claims)!.ToString());
        return tokenBuilder.Encode();
    }

    public JwtClaims VerifyJwtOrThrow(string jwt)
    {
        var token = new JwtBuilder()
            .WithAlgorithm(new HMACSHA512Algorithm())
            .WithSecret(optionsMonitor.CurrentValue.JwtSecret)
            .WithUrlEncoder(new JwtBase64UrlEncoder())
            .WithJsonSerializer(new JsonNetSerializer())
            .MustVerifySignature()
            .Decode<JwtClaims>(jwt);

        if (DateTimeOffset.FromUnixTimeSeconds(long.Parse(token.Exp)) < DateTimeOffset.UtcNow)
            throw new AuthenticationException("Token expired");
        return token;
    }
    
}
