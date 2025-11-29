using System;

namespace Core.Domain.Entities;

public partial class DocumentSignature
{
    public Guid Id { get; set; }

    public Guid Documentid { get; set; }
    public Document Document { get; set; } = null!;

    public Guid Userid { get; set; }
    public User User { get; set; } = null!;

    public string Signaturebase64 { get; set; } = null!;

    public DateTime Signedat { get; set; }

    public string? Ipaddress { get; set; }

    public DateTime Createdat { get; set; }
}