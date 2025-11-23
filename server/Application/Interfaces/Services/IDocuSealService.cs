using Application.Models.Dtos;

namespace Application.Interfaces.Services;

public interface IDocuSealService
{
    Task<DocuSealSubmissionResponseDto> CreateSubmission(
        string documentUrl,
        string signerEmail,
        string signerName);
    
    Task<string> GetSignedDocumentUrl(string submissionId);
}