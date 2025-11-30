using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class DocumentSignature
{
    public Guid Id { get; set; }

    public Guid DocumentId { get; set; }

    public Guid UserId { get; set; }

    public string SignatureBase64 { get; set; } = null!;

    public DateTime SignedAt { get; set; }

    public string? IpAddress { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Document Document { get; set; } = null!;

    public virtual User User { get; set; } = null!;
}
