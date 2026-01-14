using Microsoft.AspNetCore.Http;

namespace JurisNexo.Application.Common.Interfaces;

public interface IStorageService
{
    Task<string> UploadAsync(IFormFile file, string folder, CancellationToken cancellationToken = default);
}
