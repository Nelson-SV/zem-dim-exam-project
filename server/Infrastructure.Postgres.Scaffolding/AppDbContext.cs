using System;
using System.Collections.Generic;
using Core.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Postgres.Scaffolding;

public partial class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Document> Documents { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<Milestone> Milestones { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<Photo> Photos { get; set; }

    public virtual DbSet<Project> Projects { get; set; }

    public virtual DbSet<Refreshtoken> Refreshtokens { get; set; }

    public virtual DbSet<Threedscan> Threedscans { get; set; }

    public virtual DbSet<Update> Updates { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_authorization_status", new[] { "pending", "approved", "denied", "expired" })
            .HasPostgresEnum("auth", "oauth_client_type", new[] { "public", "confidential" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "oauth_response_type", new[] { "code" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS", "VECTOR" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<Document>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("documents_pkey");

            entity.ToTable("documents");

            entity.HasIndex(e => e.Uploadedbyid, "IX_documents_uploadedbyid");

            entity.HasIndex(e => e.Docusealsubmissionid, "idx_documents_docuseal_submission");

            entity.HasIndex(e => e.Docusealsubmissionid, "idx_documents_docusealsubmissionid");

            entity.HasIndex(e => e.Isdeleted, "idx_documents_isdeleted");

            entity.HasIndex(e => e.Issigned, "idx_documents_issigned");

            entity.HasIndex(e => e.Projectid, "idx_documents_project");

            entity.HasIndex(e => e.Documenttype, "idx_documents_type");

            entity.HasIndex(e => new { e.Projectid, e.Isvisibletoclient }, "idx_documents_visibility");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("createdat");
            entity.Property(e => e.Documenttype)
                .HasMaxLength(50)
                .HasColumnName("documenttype");
            entity.Property(e => e.Docusealoriginalurl).HasColumnName("docusealoriginalurl");
            entity.Property(e => e.Docusealsubmissionid)
                .HasMaxLength(255)
                .HasColumnName("docusealsubmissionid");
            entity.Property(e => e.Filename)
                .HasMaxLength(255)
                .HasColumnName("filename");
            entity.Property(e => e.Filesize).HasColumnName("filesize");
            entity.Property(e => e.Fileurl)
                .HasMaxLength(500)
                .HasColumnName("fileurl");
            entity.Property(e => e.Isdeleted)
                .HasDefaultValue(false)
                .HasColumnName("isdeleted");
            entity.Property(e => e.Issigned)
                .HasDefaultValue(false)
                .HasColumnName("issigned");
            entity.Property(e => e.Isvisibletoclient)
                .HasDefaultValue(true)
                .HasColumnName("isvisibletoclient");
            entity.Property(e => e.Mimetype)
                .HasMaxLength(100)
                .HasColumnName("mimetype");
            entity.Property(e => e.Projectid).HasColumnName("projectid");
            entity.Property(e => e.Requiressignature)
                .HasDefaultValue(false)
                .HasColumnName("requiressignature");
            entity.Property(e => e.Signedat)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("signedat");
            entity.Property(e => e.Signedbyuserid).HasColumnName("signedbyuserid");
            entity.Property(e => e.Signedfileurl)
                .HasMaxLength(500)
                .HasColumnName("signedfileurl");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.Uploadedbyid).HasColumnName("uploadedbyid");

            entity.HasOne(d => d.Project).WithMany(p => p.Documents)
                .HasForeignKey(d => d.Projectid)
                .HasConstraintName("documents_projectid_fkey");

            entity.HasOne(d => d.Uploadedby).WithMany(p => p.Documents)
                .HasForeignKey(d => d.Uploadedbyid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("documents_uploadedbyid_fkey");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("messages_pkey");

            entity.ToTable("messages");

            entity.HasIndex(e => e.Createdat, "idx_messages_date").IsDescending();

            entity.HasIndex(e => e.Projectid, "idx_messages_project");

            entity.HasIndex(e => e.Receiverid, "idx_messages_receiver");

            entity.HasIndex(e => e.Senderid, "idx_messages_sender");

            entity.HasIndex(e => new { e.Receiverid, e.Isread }, "idx_messages_unread").HasFilter("(isread = false)");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Attachmenttype)
                .HasMaxLength(50)
                .HasColumnName("attachmenttype");
            entity.Property(e => e.Attachmenturl)
                .HasMaxLength(500)
                .HasColumnName("attachmenturl");
            entity.Property(e => e.Content).HasColumnName("content");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Isread)
                .HasDefaultValue(false)
                .HasColumnName("isread");
            entity.Property(e => e.Projectid).HasColumnName("projectid");
            entity.Property(e => e.Readat).HasColumnName("readat");
            entity.Property(e => e.Receiverid).HasColumnName("receiverid");
            entity.Property(e => e.Senderid).HasColumnName("senderid");

            entity.HasOne(d => d.Project).WithMany(p => p.Messages)
                .HasForeignKey(d => d.Projectid)
                .HasConstraintName("messages_projectid_fkey");

            entity.HasOne(d => d.Receiver).WithMany(p => p.MessageReceivers)
                .HasForeignKey(d => d.Receiverid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("messages_receiverid_fkey");

            entity.HasOne(d => d.Sender).WithMany(p => p.MessageSenders)
                .HasForeignKey(d => d.Senderid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("messages_senderid_fkey");
        });

        modelBuilder.Entity<Milestone>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("milestones_pkey");

            entity.ToTable("milestones");

            entity.HasIndex(e => e.Isdeleted, "idx_milestones_isdeleted");

            entity.HasIndex(e => new { e.Projectid, e.Orderindex }, "idx_milestones_order");

            entity.HasIndex(e => e.Projectid, "idx_milestones_project");

            entity.HasIndex(e => e.Status, "idx_milestones_status");

            entity.HasIndex(e => new { e.Projectid, e.Orderindex }, "unique_project_order").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Actualenddate).HasColumnName("actualenddate");
            entity.Property(e => e.Actualstartdate).HasColumnName("actualstartdate");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Isdeleted)
                .HasDefaultValue(false)
                .HasColumnName("isdeleted");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.Orderindex).HasColumnName("orderindex");
            entity.Property(e => e.Plannedenddate).HasColumnName("plannedenddate");
            entity.Property(e => e.Plannedstartdate).HasColumnName("plannedstartdate");
            entity.Property(e => e.Progresspercentage)
                .HasDefaultValue(0)
                .HasColumnName("progresspercentage");
            entity.Property(e => e.Projectid).HasColumnName("projectid");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'Pending'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.Updatedat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("updatedat");

            entity.HasOne(d => d.Project).WithMany(p => p.Milestones)
                .HasForeignKey(d => d.Projectid)
                .HasConstraintName("milestones_projectid_fkey");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("notifications_pkey");

            entity.ToTable("notifications");

            entity.HasIndex(e => e.Projectid, "IX_notifications_projectid");

            entity.HasIndex(e => e.Createdat, "idx_notifications_date").IsDescending();

            entity.HasIndex(e => new { e.Userid, e.Isread }, "idx_notifications_unread").HasFilter("(isread = false)");

            entity.HasIndex(e => e.Userid, "idx_notifications_user");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Actionurl)
                .HasMaxLength(500)
                .HasColumnName("actionurl");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Isread)
                .HasDefaultValue(false)
                .HasColumnName("isread");
            entity.Property(e => e.Message).HasColumnName("message");
            entity.Property(e => e.Projectid).HasColumnName("projectid");
            entity.Property(e => e.Readat).HasColumnName("readat");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.Type)
                .HasMaxLength(50)
                .HasColumnName("type");
            entity.Property(e => e.Userid).HasColumnName("userid");

            entity.HasOne(d => d.Project).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.Projectid)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("notifications_projectid_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.Userid)
                .HasConstraintName("notifications_userid_fkey");
        });

        modelBuilder.Entity<Photo>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("photos_pkey");

            entity.ToTable("photos");

            entity.HasIndex(e => e.Uploadedbyid, "IX_photos_uploadedbyid");

            entity.HasIndex(e => e.Takenat, "idx_photos_date").IsDescending();

            entity.HasIndex(e => e.Isdeleted, "idx_photos_isdeleted");

            entity.HasIndex(e => e.Milestoneid, "idx_photos_milestone");

            entity.HasIndex(e => e.Projectid, "idx_photos_project");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Caption).HasColumnName("caption");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Filename)
                .HasMaxLength(255)
                .HasColumnName("filename");
            entity.Property(e => e.Filesize).HasColumnName("filesize");
            entity.Property(e => e.Fileurl)
                .HasMaxLength(500)
                .HasColumnName("fileurl");
            entity.Property(e => e.Height).HasColumnName("height");
            entity.Property(e => e.Isdeleted)
                .HasDefaultValue(false)
                .HasColumnName("isdeleted");
            entity.Property(e => e.Milestoneid).HasColumnName("milestoneid");
            entity.Property(e => e.Mimetype)
                .HasMaxLength(100)
                .HasColumnName("mimetype");
            entity.Property(e => e.Projectid).HasColumnName("projectid");
            entity.Property(e => e.Takenat).HasColumnName("takenat");
            entity.Property(e => e.Thumbnailurl)
                .HasMaxLength(500)
                .HasColumnName("thumbnailurl");
            entity.Property(e => e.Uploadedbyid).HasColumnName("uploadedbyid");
            entity.Property(e => e.Width).HasColumnName("width");

            entity.HasOne(d => d.Milestone).WithMany(p => p.Photos)
                .HasForeignKey(d => d.Milestoneid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("photos_milestoneid_fkey");

            entity.HasOne(d => d.Project).WithMany(p => p.Photos)
                .HasForeignKey(d => d.Projectid)
                .HasConstraintName("photos_projectid_fkey");

            entity.HasOne(d => d.Uploadedby).WithMany(p => p.Photos)
                .HasForeignKey(d => d.Uploadedbyid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("photos_uploadedbyid_fkey");
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("projects_pkey");

            entity.ToTable("projects");

            entity.HasIndex(e => e.Clientid, "idx_projects_client");

            entity.HasIndex(e => new { e.Startdate, e.Plannedenddate }, "idx_projects_dates");

            entity.HasIndex(e => e.Isdeleted, "idx_projects_isdeleted").HasFilter("(isdeleted = false)");

            entity.HasIndex(e => e.Status, "idx_projects_status");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Actualenddate).HasColumnName("actualenddate");
            entity.Property(e => e.Address)
                .HasMaxLength(300)
                .HasColumnName("address");
            entity.Property(e => e.Budget)
                .HasPrecision(15, 2)
                .HasColumnName("budget");
            entity.Property(e => e.City)
                .HasMaxLength(100)
                .HasColumnName("city");
            entity.Property(e => e.Clientid).HasColumnName("clientid");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Isdeleted)
                .HasDefaultValue(false)
                .HasColumnName("isdeleted");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.Plannedenddate).HasColumnName("plannedenddate");
            entity.Property(e => e.Postalcode)
                .HasMaxLength(20)
                .HasColumnName("postalcode");
            entity.Property(e => e.Progresspercentage)
                .HasDefaultValue(0)
                .HasColumnName("progresspercentage");
            entity.Property(e => e.Startdate).HasColumnName("startdate");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValueSql("'''Pending''::character varying'::character varying")
                .HasColumnName("status");
            entity.Property(e => e.Thumbnailurl)
                .HasMaxLength(500)
                .HasColumnName("thumbnailurl");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.Totalarea)
                .HasPrecision(10, 2)
                .HasColumnName("totalarea");
            entity.Property(e => e.Updatedat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("updatedat");

            entity.HasOne(d => d.Client).WithMany(p => p.Projects)
                .HasForeignKey(d => d.Clientid)
                .HasConstraintName("projects_clientid_fkey");
        });

        modelBuilder.Entity<Refreshtoken>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("refreshtokens_pkey");

            entity.ToTable("refreshtokens");

            entity.HasIndex(e => new { e.Userid, e.Isrevoked }, "idx_refresh_tokens_active").HasFilter("(isrevoked = false)");

            entity.HasIndex(e => e.Token, "idx_refresh_tokens_token");

            entity.HasIndex(e => e.Userid, "idx_refresh_tokens_user");

            entity.HasIndex(e => e.Token, "refreshtokens_token_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Expiresat).HasColumnName("expiresat");
            entity.Property(e => e.Isrevoked)
                .HasDefaultValue(false)
                .HasColumnName("isrevoked");
            entity.Property(e => e.Revokedat).HasColumnName("revokedat");
            entity.Property(e => e.Token)
                .HasMaxLength(500)
                .HasColumnName("token");
            entity.Property(e => e.Userid).HasColumnName("userid");

            entity.HasOne(d => d.User).WithMany(p => p.Refreshtokens)
                .HasForeignKey(d => d.Userid)
                .HasConstraintName("refreshtokens_userid_fkey");
        });

        modelBuilder.Entity<Threedscan>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("threedscans_pkey");

            entity.ToTable("threedscans");

            entity.HasIndex(e => e.Uploadedbyid, "IX_threedscans_uploadedbyid");

            entity.HasIndex(e => e.Milestoneid, "idx_3dscans_milestone");

            entity.HasIndex(e => e.Projectid, "idx_3dscans_project");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Fileformat)
                .HasMaxLength(50)
                .HasColumnName("fileformat");
            entity.Property(e => e.Filename)
                .HasMaxLength(255)
                .HasColumnName("filename");
            entity.Property(e => e.Filesize).HasColumnName("filesize");
            entity.Property(e => e.Fileurl)
                .HasMaxLength(500)
                .HasColumnName("fileurl");
            entity.Property(e => e.Milestoneid).HasColumnName("milestoneid");
            entity.Property(e => e.Notes).HasColumnName("notes");
            entity.Property(e => e.Projectid).HasColumnName("projectid");
            entity.Property(e => e.Roomarea)
                .HasPrecision(10, 2)
                .HasColumnName("roomarea");
            entity.Property(e => e.Roomname)
                .HasMaxLength(100)
                .HasColumnName("roomname");
            entity.Property(e => e.Scannedat).HasColumnName("scannedat");
            entity.Property(e => e.Uploadedbyid).HasColumnName("uploadedbyid");

            entity.HasOne(d => d.Milestone).WithMany(p => p.Threedscans)
                .HasForeignKey(d => d.Milestoneid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("threedscans_milestoneid_fkey");

            entity.HasOne(d => d.Project).WithMany(p => p.Threedscans)
                .HasForeignKey(d => d.Projectid)
                .HasConstraintName("threedscans_projectid_fkey");

            entity.HasOne(d => d.Uploadedby).WithMany(p => p.Threedscans)
                .HasForeignKey(d => d.Uploadedbyid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("threedscans_uploadedbyid_fkey");
        });

        modelBuilder.Entity<Update>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("updates_pkey");

            entity.ToTable("updates");

            entity.HasIndex(e => e.Createdbyid, "IX_updates_createdbyid");

            entity.HasIndex(e => e.Milestoneid, "IX_updates_milestoneid");

            entity.HasIndex(e => e.Createdat, "idx_updates_date").IsDescending();

            entity.HasIndex(e => e.Projectid, "idx_updates_project");

            entity.HasIndex(e => e.Updatetype, "idx_updates_type");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Createdbyid).HasColumnName("createdbyid");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Milestoneid).HasColumnName("milestoneid");
            entity.Property(e => e.Projectid).HasColumnName("projectid");
            entity.Property(e => e.Title)
                .HasMaxLength(200)
                .HasColumnName("title");
            entity.Property(e => e.Updatetype)
                .HasMaxLength(50)
                .HasColumnName("updatetype");

            entity.HasOne(d => d.Createdby).WithMany(p => p.Updates)
                .HasForeignKey(d => d.Createdbyid)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("updates_createdbyid_fkey");

            entity.HasOne(d => d.Milestone).WithMany(p => p.Updates)
                .HasForeignKey(d => d.Milestoneid)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("updates_milestoneid_fkey");

            entity.HasOne(d => d.Project).WithMany(p => p.Updates)
                .HasForeignKey(d => d.Projectid)
                .HasConstraintName("updates_projectid_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "idx_users_email");

            entity.HasIndex(e => e.Role, "idx_users_role");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Createdat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("createdat");
            entity.Property(e => e.Email)
                .HasMaxLength(255)
                .HasColumnName("email");
            entity.Property(e => e.Firstname)
                .HasMaxLength(100)
                .HasColumnName("firstname");
            entity.Property(e => e.Isactive)
                .HasDefaultValue(true)
                .HasColumnName("isactive");
            entity.Property(e => e.Isdeleted)
                .HasDefaultValue(false)
                .HasColumnName("isdeleted");
            entity.Property(e => e.Language)
                .HasMaxLength(5)
                .HasDefaultValueSql("'ua'::character varying")
                .HasColumnName("language");
            entity.Property(e => e.Lastloginat).HasColumnName("lastloginat");
            entity.Property(e => e.Lastname)
                .HasMaxLength(100)
                .HasColumnName("lastname");
            entity.Property(e => e.Mustchangepassword)
                .HasDefaultValue(false)
                .HasColumnName("mustchangepassword");
            entity.Property(e => e.Passwordhash)
                .HasMaxLength(255)
                .HasColumnName("passwordhash");
            entity.Property(e => e.Phonenumber)
                .HasMaxLength(20)
                .HasColumnName("phonenumber");
            entity.Property(e => e.Profileimageurl)
                .HasMaxLength(500)
                .HasColumnName("profileimageurl");
            entity.Property(e => e.Role)
                .HasMaxLength(20)
                .HasColumnName("role");
            entity.Property(e => e.Salt).HasColumnName("salt");
            entity.Property(e => e.Updatedat)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnName("updatedat");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
