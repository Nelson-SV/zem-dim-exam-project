using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

/// <summary>
/// Per-user notification settings
/// </summary>
public partial class Usersetting
{
    public Guid Id { get; set; }

    public Guid Userid { get; set; }

    public bool? Emailalerts { get; set; }

    public string? Reportfrequency { get; set; }

    public bool? Clientupdates { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }

    public virtual User User { get; set; } = null!;
}
