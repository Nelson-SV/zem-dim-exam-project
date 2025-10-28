using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Authentication;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Infrastructure.Postgres.Admin.UserManagement;
using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Application.Models.Dtos.UserManagement;
using Application.Models.Enums;
using Application.Models.Security;
using Core.Domain.Entities;
using JWT;
using JWT.Algorithms;
using JWT.Builder;
using JWT.Serializers;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Application.Services.Security;

public class SecurityService(
    IOptionsMonitor<AppOptions> optionsMonitor, 
    IUserManagementRepository managementRepository) : ISecurityService
{
    public AuthResponseDto Login(AuthRequestDto dto)
    {
        var user = managementRepository.GetUserByEmailOrNull(dto.Email) ?? throw new ValidationException("User email not found");
        
        if (user.Isactive != true)
            throw new ValidationException("User is inactive");
        
        VerifyPasswordOrThrow(dto.Password + user.Salt, user.Passwordhash);
        /*
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
        */
        return new AuthResponseDto
        {
            Jwt = GenerateJwtFor(user, dto.Email)
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

    /*
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
    
    //The one i changed - Nelson
    public string GenerateJwt(JwtClaims claims)
       {
           var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(optionsMonitor.CurrentValue.JwtSecret));
           var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha512);

           var token = new JwtSecurityToken(
               claims: new[]
               {
                   new Claim(ClaimTypes.NameIdentifier, claims.Id),
                   new Claim(ClaimTypes.Role, claims.Role),
                   new Claim(ClaimTypes.Email, claims.Email)
               },
               expires: DateTimeOffset.FromUnixTimeSeconds(long.Parse(claims.Exp)).UtcDateTime,
               signingCredentials: creds
           );
           
           return new JwtSecurityTokenHandler().WriteToken(token);
       }
    */
    
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

    /*
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
    */
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
    
    public string GenerateRandomPassword(int length = 12)
    {
        const string upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";  // removed I and O
        const string lower = "abcdefghijkmnopqrstuvwxyz";  // removed l
        const string digits = "23456789";                  // removed 0 and 1
        const string specials = "@#$%&*?!";
        const string allChars = upper + lower + digits + specials;

        var randomBytes = new byte[length];
        using (var rng = RandomNumberGenerator.Create())
            rng.GetBytes(randomBytes);

        var password = new StringBuilder(length);

        // Ensure at least one character from each category
        password.Append(upper[randomBytes[0] % upper.Length]);
        password.Append(lower[randomBytes[1] % lower.Length]);
        password.Append(digits[randomBytes[2] % digits.Length]);
        password.Append(specials[randomBytes[3] % specials.Length]);

        // Fill the rest randomly
        for (int i = 4; i < length; i++)
        {
            password.Append(allChars[randomBytes[i] % allChars.Length]);
        }

        // Shuffle result to avoid predictable positions
        return new string(password.ToString().OrderBy(_ => RandomNumberGenerator.GetInt32(100)).ToArray());
    }
}
