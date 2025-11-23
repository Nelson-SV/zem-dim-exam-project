using System.Text.Json;
using Application.Interfaces.Services;
using Application.Models.Dtos;
using Microsoft.Extensions.Configuration;
using RestSharp;

namespace Application.Services.Documents;

public class DocuSealService : IDocuSealService
{
    private readonly RestClient _client;
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;

    public DocuSealService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        var baseUrl = configuration["DocuSeal:BaseUrl"] ?? throw new InvalidOperationException("DocuSeal:BaseUrl is missing");
        _apiKey = configuration["DocuSeal:ApiKey"] ?? throw new InvalidOperationException("DocuSeal:ApiKey is missing");

        _client = new RestClient(baseUrl.TrimEnd('/'));
        _httpClient = httpClientFactory.CreateClient();
    }

    public async Task<DocuSealSubmissionResponseDto> CreateSubmission(
        string documentUrl,
        string signerEmail,
        string signerName)
    {
        Console.WriteLine("🔑 API Key: " + _apiKey[..10] + "...");
        Console.WriteLine("🌐 Base URL: " + _client.Options.BaseUrl);
        Console.WriteLine("📄 Document URL: " + documentUrl);
        Console.WriteLine("📧 Signer Email: " + signerEmail);

        // Завантажити PDF з Supabase і конвертувати в base64
        string base64Content;
        try
        {
            var pdfBytes = await _httpClient.GetByteArrayAsync(documentUrl);
            base64Content = Convert.ToBase64String(pdfBytes);
            Console.WriteLine($"📦 PDF size: {pdfBytes.Length} bytes");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Error downloading PDF: {ex.Message}");
            throw new Exception($"Failed to download PDF from {documentUrl}: {ex.Message}");
        }

        var request = new RestRequest("submissions/pdf", Method.Post);
        request.AddHeader("X-Auth-Token", _apiKey);
        request.AddHeader("Content-Type", "application/json");

        var body = new
        {
            name = "Document Submission",
            documents = new[]
            {
                new
                {
                    name = "Document",
                    file = base64Content
                }
            },
            send_email = true,
            submitters = new[]
            {
                new
                {
                    email = signerEmail,
                    name = signerName,
                    role = "Signer"
                }
            }
        };

        request.AddJsonBody(body);

        Console.WriteLine("🚀 Sending request to submissions/pdf...");
        var response = await _client.ExecuteAsync(request);

        Console.WriteLine($"📥 Status Code: {response.StatusCode}");
        Console.WriteLine($"📥 Response: {response.Content}");

        if (!response.IsSuccessful || string.IsNullOrWhiteSpace(response.Content))
        {
            throw new Exception($"DocuSeal API error: {response.Content}");
        }

        using var json = JsonDocument.Parse(response.Content);
        var root = json.RootElement;

        // Відповідь - це об'єкт submission з масивом submitters
        var submitters = root.GetProperty("submitters");
        var firstSubmitter = submitters[0];

        var submissionId = firstSubmitter.GetProperty("id").GetInt32().ToString();
        var embedSrc = firstSubmitter.GetProperty("embed_src").GetString()!;

        return new DocuSealSubmissionResponseDto
        {
            SubmissionId = submissionId,
            SigningUrl = embedSrc,
            EmailSent = false
        };
    }

    public async Task<string> GetSignedDocumentUrl(string submissionId)
    {
        var request = new RestRequest($"submissions/{submissionId}", Method.Get);
        request.AddHeader("X-Auth-Token", _apiKey);

        var response = await _client.ExecuteAsync(request);

        Console.WriteLine($"📥 [GetSignedDocumentUrl] Status: {response.StatusCode}");
        Console.WriteLine($"📥 [GetSignedDocumentUrl] Body: {response.Content}");

        if (!response.IsSuccessful || string.IsNullOrWhiteSpace(response.Content))
        {
            throw new Exception($"DocuSeal API error: {response.Content}");
        }

        using var json = JsonDocument.Parse(response.Content);
        var root = json.RootElement;

        var documentUrl = root
            .GetProperty("documents")[0]
            .GetProperty("url")
            .GetString();

        return documentUrl!;
    }
}