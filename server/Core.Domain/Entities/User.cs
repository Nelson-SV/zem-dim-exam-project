using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class User
{
    public Guid Id { get; set; }

    public string Email { get; set; } = null!;

    public string Passwordhash { get; set; } = null!;

    public string Salt { get; set; } = null!;

    public string Firstname { get; set; } = null!;

    public string Lastname { get; set; } = null!;

    public string? Phonenumber { get; set; }

    public string Role { get; set; } = null!;

    public bool? Isactive { get; set; }

    public string? Profileimageurl { get; set; }

    public string? Language { get; set; }

    public DateTime? Createdat { get; set; }

    public DateTime? Updatedat { get; set; }

    public DateTime? Lastloginat { get; set; }

    public bool? Mustchangepassword { get; set; }

    public bool? Isdeleted { get; set; }

    public virtual ICollection<DocumentSignature> DocumentSignatures { get; set; } = new List<DocumentSignature>();

    public virtual ICollection<Document> Documents { get; set; } = new List<Document>();

    public virtual ICollection<Message> MessageReceivers { get; set; } = new List<Message>();

    public virtual ICollection<Message> MessageSenders { get; set; } = new List<Message>();

    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();

    public virtual ICollection<Photo> Photos { get; set; } = new List<Photo>();

    public virtual ICollection<Project> Projects { get; set; } = new List<Project>();

    public virtual ICollection<Refreshtoken> Refreshtokens { get; set; } = new List<Refreshtoken>();

    public virtual ICollection<Threedscan> Threedscans { get; set; } = new List<Threedscan>();

    public virtual ICollection<Update> Updates { get; set; } = new List<Update>();

    public virtual Usersetting? Usersetting { get; set; }
}
