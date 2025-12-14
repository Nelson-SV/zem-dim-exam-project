// PdfSignatureService.cs - UPDATED with coordinate support
using Application.Interfaces.Documents;
using Application.Interfaces.Services;
using iTextSharp.text;
using iTextSharp.text.pdf;

namespace Application.Services.Documents;

public class PdfSignatureService : IPdfSignatureService
{
    private readonly IStorageService _storageService;

    public PdfSignatureService(IStorageService storageService)
    {
        _storageService = storageService;
    }

    public async Task<string> SignDocumentAsync(
        Core.Domain.Entities.Document document,
        string signatureBase64,
        double positionX,
        double positionY,
        double width,
        double height,
        int pageNumber = default)
    {
        if (string.IsNullOrWhiteSpace(document.Fileurl))
            throw new InvalidOperationException("Document does not have a file URL.");

        // 1. Download the original PDF from Supabase
        var pdfBytes = await _storageService.DownloadFileAsync(document.Fileurl);

        // 2. Extract the pure Base64 payload from the data URL
        var base64Part = signatureBase64.Contains(",")
            ? signatureBase64.Split(',')[1]
            : signatureBase64;

        var signatureBytes = Convert.FromBase64String(base64Part);

        // 3. Insert the signature into the PDF at the requested position
        using var inputMs = new MemoryStream(pdfBytes);
        using var reader = new PdfReader(inputMs);
        using var outputMs = new MemoryStream();

        using (var stamper = new PdfStamper(reader, outputMs))
        {
            // Ensure pageNumber stays within the document bounds
            if (pageNumber < 1 || pageNumber > reader.NumberOfPages)
                pageNumber = 1;

            var image = Image.GetInstance(signatureBytes);
            
            // Honor the signature dimensions from the frontend
            image.ScaleToFit((float)width, (float)height);

            // PDF coordinates: Y is counted from the bottom, so invert it
            var page = reader.GetPageSize(pageNumber);
            var pdfY = page.Height - (float)positionY - (float)height;

            image.SetAbsolutePosition((float)positionX, pdfY);

            var content = stamper.GetOverContent(pageNumber);
            content.AddImage(image);
        }

        var signedPdfBytes = outputMs.ToArray();

        // 4. Generate a file name for the signed PDF
        var signedFileName = $"{document.Id}-signed.pdf";

        // 5. Upload the signed PDF back to Supabase
        var signedUrl = await _storageService.UploadSignedPdfAsync(signedPdfBytes, signedFileName);

        return signedUrl;
    }
}
