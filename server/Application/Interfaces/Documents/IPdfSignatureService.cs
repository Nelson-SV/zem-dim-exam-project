using Core.Domain.Entities;

namespace Application.Interfaces.Documents;

public interface IPdfSignatureService
{
    Task<string> SignDocumentAsync(
        Document document,
        string signatureBase64,
        double positionX,
        double positionY,
        double width,
        double height,
        int pageNumber = default);
}