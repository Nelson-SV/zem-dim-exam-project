using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

/// <summary>
/// Global company information and settings
/// </summary>
public partial class Company
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Email { get; set; } = null!;

    public string? Phone { get; set; }

    public string? Website { get; set; }

    public string? Address { get; set; }

    public string? Currency { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }
}
