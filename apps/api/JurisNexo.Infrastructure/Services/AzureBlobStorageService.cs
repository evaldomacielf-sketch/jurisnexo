using Azure.Storage.Blobs;
using Azure.Storage.Sas;
using JurisNexo.Application.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace JurisNexo.Infrastructure.Services;

public class AzureBlobStorageService : IStorageService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AzureBlobStorageService> _logger;
    private readonly BlobServiceClient _blobServiceClient;

    public AzureBlobStorageService(IConfiguration configuration, ILogger<AzureBlobStorageService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        var connectionString = _configuration["Azure:Storage:ConnectionString"];
        if (!string.IsNullOrEmpty(connectionString))
        {
            _blobServiceClient = new BlobServiceClient(connectionString);
        }
        else 
        {
            // Fallback/Mock for dev if not configured
             // In production this should throw or be handled
             _blobServiceClient = null!; 
        }
    }

    public async Task<string> UploadAsync(IFormFile file, string folder, CancellationToken cancellationToken = default)
    {
        if (_blobServiceClient == null)
        {
             // Mock implementation for development without Azure
             return $"https://mock-storage.jurisnexo.com/{folder}/{file.FileName}";
        }

        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient("whatsapp-media");
            await containerClient.CreateIfNotExistsAsync(cancellationToken: cancellationToken);

            var fileName = $"{folder}/{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
            var blobClient = containerClient.GetBlobClient(fileName);

            using var stream = file.OpenReadStream();
            await blobClient.UploadAsync(stream, overwrite: true, cancellationToken);

            // Generate SAS Token for 24 hours access (Security requirement)
            var sasBuilder = new BlobSasBuilder
            {
                BlobContainerName = containerClient.Name,
                BlobName = blobClient.Name,
                Resource = "b",
                ExpiresOn = DateTimeOffset.UtcNow.AddHours(24)
            };
            sasBuilder.SetPermissions(BlobSasPermissions.Read);

            var sasToken = blobClient.GenerateSasUri(sasBuilder);
            return sasToken.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Azure Blob Storage");
            throw;
        }
    }
}
