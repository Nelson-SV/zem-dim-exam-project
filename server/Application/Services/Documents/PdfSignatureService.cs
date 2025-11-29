// PdfSignatureService.cs - ОНОВЛЕНИЙ з підтримкою координат
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
        int pageNumber,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(document.Fileurl))
            throw new InvalidOperationException("Document does not have a file URL.");

        // 1. Скачати оригінальний PDF з Supabase
        var pdfBytes = await _storageService.DownloadFileAsync(document.Fileurl);

        // 2. Витягнути чисту Base64-частину з data URL
        var base64Part = signatureBase64.Contains(",")
            ? signatureBase64.Split(',')[1]
            : signatureBase64;

        var signatureBytes = Convert.FromBase64String(base64Part);

        // 3. Вставити підпис у PDF на вказаній позиції
        using var inputMs = new MemoryStream(pdfBytes);
        using var reader = new PdfReader(inputMs);
        using var outputMs = new MemoryStream();

        using (var stamper = new PdfStamper(reader, outputMs))
        {
            // Переконайся що pageNumber в межах документа
            if (pageNumber < 1 || pageNumber > reader.NumberOfPages)
                pageNumber = 1;

            var image = Image.GetInstance(signatureBytes);
            
            // Встановити розмір підпису з frontend
            image.ScaleToFit((float)width, (float)height);

            // PDF координати: Y відраховується знизу, тому інвертуємо
            var page = reader.GetPageSize(pageNumber);
            var pdfY = page.Height - (float)positionY - (float)height;

            image.SetAbsolutePosition((float)positionX, pdfY);

            var content = stamper.GetOverContent(pageNumber);
            content.AddImage(image);
        }

        var signedPdfBytes = outputMs.ToArray();

        // 4. Згенерувати ім'я файлу для підписаного PDF
        var signedFileName = $"{document.Id}-signed.pdf";

        // 5. Залити підписаний PDF у Supabase
        var signedUrl = await _storageService.UploadSignedPdfAsync(signedPdfBytes, signedFileName);

        return signedUrl;
    }
}