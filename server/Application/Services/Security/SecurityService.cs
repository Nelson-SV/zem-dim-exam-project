using System.ComponentModel.DataAnnotations;
using System.Security.Authentication;
using System.Security.Cryptography;
using System.Text;
using Application.Interfaces.Infrastructure.Postgres;
using Application.Interfaces.Security;
using Application.Models.Dtos.Auth;
using Application.Models.Enums;
using Application.Models.Security;
using Application.Services.Email;
using Common.Email.TemplateReader;
using Core.Domain.Entities;
using JWT;
using JWT.Algorithms;
using JWT.Builder;
using JWT.Serializers;
using Microsoft.Extensions.Options;

namespace Application.Services.Security;

public class SecurityService(IOptionsMonitor<AppOptions> optionsMonitor, IUserRepository repository, EmailService emailService, TemplateReader templateReader) : ISecurityService
{
    public AuthResponseDto Login(AuthRequestDto dto)
    {
        var user = repository.GetUserByEmailOrNull(dto.Email) ?? throw new ValidationException("User email not found");
        
        if (user.Isactive != true)
            throw new ValidationException("User is inactive");
            
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

    public async Task<RegisterResponseDto> Register(RegisterRequestDto dto)
    {
        var existing = repository.GetUserByEmailOrNull(dto.Email);
        if (existing is not null) throw new ValidationException("User already exists");

        var password = GenerateRandomPassword();
        var salt = GenerateSalt();
        var hash = HashPassword(password + salt);
        var insertedUser = new User();
        
        try
        {
            insertedUser = repository.AddUser(new User
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
                Passwordhash = hash,
                Mustchangepassword = true,
            });

            var template = templateReader.LoadTemplate("TemporaryPasswordEmail.html");
            var body = template.Replace("{{CustomerName}}", dto.FirstName)
                .Replace("{{Password}}", password)
                .Replace("{{Email}}", dto.Email);
            
            await emailService.SendEmailAsync(dto.Email, "Your account has been created", body);
            
            return RegisterResponseDto.FromEntity(insertedUser);
        }
        catch (Exception ex)
        {
            repository.DeleteUser(insertedUser.Id.ToString());
            throw new ApplicationException("Failed to send email to the user. Registration rolled back and user was deleted.", ex);
        }
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

