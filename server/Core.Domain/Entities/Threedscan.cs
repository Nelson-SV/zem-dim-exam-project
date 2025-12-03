using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Threedscan
{
    public Guid Id { get; set; }

    public Guid Projectid { get; set; }

    public Guid? Milestoneid { get; set; }

    public string Roomname { get; set; } = null!;

    public string Filename { get; set; } = null!;

    public string Fileurl { get; set; } = null!;

    public string Filetype { get; set; } = null!;

    public decimal Roomarea { get; set; }

    public DateTime Scannedat { get; set; }

    public Guid Uploadedbyid { get; set; }

    public string? Notes { get; set; }

    public DateTime Createdat { get; set; }

    public virtual Milestone? Milestone { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User Uploadedby { get; set; } = null!;
}
