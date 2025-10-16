using System.ComponentModel.DataAnnotations;

namespace Application.Models.Enums;

public class Roles
{
    [Required] public static string UserRole = "user";

    [Required] public static string AdminRole = "admin";
}