using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Project
{
    public Guid Id { get; set; }

    public Guid Clientid { get; set; }

    public string Title { get; set; } = null!;

    public string? Notes { get; set; }

    public string Address { get; set; } = null!;

    public string City { get; set; } = null!;

    public string Postalcode { get; set; } = null!;

    public string Status { get; set; } = null!;

    public DateOnly Startdate { get; set; }

    public DateOnly Plannedenddate { get; set; }

    public DateOnly? Actualenddate { get; set; }

    public decimal Totalarea { get; set; }

    public decimal Budget { get; set; }

    public int Progresspercentage { get; set; }

    public string? Thumbnailurl { get; set; }

    public DateTime Createdat { get; set; }

    public DateTime Updatedat { get; set; }

    public bool Isdeleted { get; set; }

    public virtual User Client { get; set; } = null!;

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

    public virtual ICollection<Message> Messages { get; set; } = new List<Message>();

    public virtual ICollection<Milestone> Milestones { get; set; } = new List<Milestone>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();

    public virtual ICollection<Threedscan> Threedscans { get; set; } = new List<Threedscan>();

    public virtual ICollection<Update> Updates { get; set; } = new List<Update>();
}
