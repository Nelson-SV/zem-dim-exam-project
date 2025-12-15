namespace Application.Models.Security;

public class JwtClaims
{
    public required string Role { get; set; }
    public required string Email { get; set; }
    public required string Id { get; set; }
    public required string Exp { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
}