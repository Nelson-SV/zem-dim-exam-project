using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Message
{
    public Guid Id { get; set; }

    public Guid Projectid { get; set; }

    public Guid Senderid { get; set; }

    public Guid Receiverid { get; set; }

    public string Content { get; set; } = null!;

    public bool? Isread { get; set; }

    public DateTime? Readat { get; set; }

    public string? Attachmenturl { get; set; }

    public string? Attachmenttype { get; set; }

    public DateTime? Createdat { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User Receiver { get; set; } = null!;

    public virtual User Sender { get; set; } = null!;
}
