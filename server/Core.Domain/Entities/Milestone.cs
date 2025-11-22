using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Milestone
{
    public Guid Id { get; set; }

    public Guid Projectid { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public int Orderindex { get; set; }

    public string Status { get; set; } = null!;

    public int? Progresspercentage { get; set; }

    public DateOnly? Plannedstartdate { get; set; }

    public DateOnly? Plannedenddate { get; set; }

    public DateOnly? Actualstartdate { get; set; }

    public DateOnly? Actualenddate { get; set; }

    public string? Notes { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }

    public bool Isdeleted { get; set; }

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();

    public virtual Project Project { get; set; } = null!;

    public virtual ICollection<Threedscan> Threedscans { get; set; } = new List<Threedscan>();

    public virtual ICollection<Update> Updates { get; set; } = new List<Update>();
}
