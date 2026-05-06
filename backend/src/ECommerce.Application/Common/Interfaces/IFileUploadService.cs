namespace ECommerce.Application.Common.Interfaces;

public interface IFileUploadService
{
    Task<(string Url, string PublicId)> UploadAsync(Stream fileStream, string fileName, string folder, CancellationToken cancellationToken = default);
    Task DeleteAsync(string publicId, CancellationToken cancellationToken = default);
}
