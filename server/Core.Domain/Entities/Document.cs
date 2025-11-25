using System;
using System.Collections.Generic;

namespace Core.Domain.Entities;

public partial class Document
{
    public Guid Id { get; set; }

    public Guid Projectid { get; set; }

    public string Title { get; set; } = null!;

    public string Filename { get; set; } = null!;

    public string Fileurl { get; set; } = null!;

    public long? Filesize { get; set; }

    public string? Mimetype { get; set; }

    public string Documenttype { get; set; } = null!;

    public Guid Uploadedbyid { get; set; }

    public bool? Isvisibletoclient { get; set; }

    public DateTime? Createdat { get; set; }

    public bool Isdeleted { get; set; }

    public string? Docusealsubmissionid { get; set; }

    public bool? Requiressignature { get; set; }

    public bool? Issigned { get; set; }

    public Guid? Signedbyuserid { get; set; }

    public DateTime? Signedat { get; set; }

    public string? Signedfileurl { get; set; }

    public string? Docusealoriginalurl { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual User Uploadedby { get; set; } = null!;
}
