using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Photo
{
    public Guid Id { get; set; }

    public Guid Projectid { get; set; }

    public Guid? Milestoneid { get; set; }

    public string Filename { get; set; } = null!;

    public string Fileurl { get; set; } = null!;

    public string Filetype { get; set; } = null!;

    public string Caption { get; set; } = null!;

    public DateTime Takenat { get; set; }

    public Guid Uploadedbyid { get; set; }

    public DateTime Createdat { get; set; }

    public bool Isdeleted { get; set; }

    public virtual Milestone? Milestone { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User Uploadedby { get; set; } = null!;
}
