using System;
using System.Text.Json.Serialization;

namespace Application.Models.Dtos;

// =============================
// 1. Request: Create Submission
// =============================
public record CreateDocuSealSubmissionDto
{
    public required Guid DocumentId { get; init; }
    public required string SignerEmail { get; init; }
    public required string SignerName { get; init; }
}

// =============================
// 2. Response from DocuSeal
// =============================
public record DocuSealSubmissionResponseDto
{
    public required string SubmissionId { get; init; }
    public required string SigningUrl { get; init; }
    public required bool EmailSent { get; init; }
}

// =============================
// 3. Webhook: incoming callback
// =============================
public record DocuSealWebhookDto
{
    [JsonPropertyName("eventType")]
    public required string EventType { get; init; }

    [JsonPropertyName("data")]
    public required SubmissionData Data { get; init; }
}

public record SubmissionData
{
    [JsonPropertyName("submissionId")]
    public required string SubmissionId { get; init; }

    [JsonPropertyName("status")]
    public required string Status { get; init; }

    [JsonPropertyName("signedDocumentUrl")]
    public required string SignedDocumentUrl { get; init; }
}

// =============================
// 4. Webhook Response (to Swagger)
// =============================
public record DocuSealWebhookResponseDto
{
    public string Message { get; init; } = string.Empty;

    public Guid? DocumentId { get; init; }

    public string? SignedFileUrl { get; init; }
}