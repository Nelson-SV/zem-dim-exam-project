using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Update
{
    public Guid Id { get; set; }

    public Guid Projectid { get; set; }

    public Guid? Milestoneid { get; set; }

    public string Updatetype { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public Guid Createdbyid { get; set; }

    public DateTime? Createdat { get; set; }

    public virtual User Createdby { get; set; } = null!;

    public virtual Milestone? Milestone { get; set; }

    public virtual Project Project { get; set; } = null!;
}
