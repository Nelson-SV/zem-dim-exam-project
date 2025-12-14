using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Notification
{
    public Guid Id { get; set; }

    public Guid Userid { get; set; }

    public Guid? Projectid { get; set; }

    public string Title { get; set; } = null!;

    public string Message { get; set; } = null!;

    public string Type { get; set; } = null!;

    public bool? Isread { get; set; }

    public DateTime? Readat { get; set; }

    public string? Actionurl { get; set; }

    public DateTime? Createdat { get; set; }

    public virtual Project? Project { get; set; }

    public virtual User User { get; set; } = null!;
}
