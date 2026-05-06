using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using ECommerce.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECommerce.Infrastructure.Services;

public class CloudinaryService : IFileUploadService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryService(IConfiguration configuration)
    {
        var cloudName = configuration["Cloudinary:CloudName"]!;
        var apiKey = configuration["Cloudinary:ApiKey"]!;
        var apiSecret = configuration["Cloudinary:ApiSecret"]!;

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account) { Api = { Secure = true } };
    }

    public async Task<(string Url, string PublicId)> UploadAsync(
        Stream fileStream,
        string fileName,
        string folder,
        CancellationToken cancellationToken = default)
    {
        var uploadParams = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = folder,
            UseFilename = false,
            UniqueFilename = true,
            Overwrite = false,
        };

        var result = await _cloudinary.UploadAsync(uploadParams);

        if (result.Error is not null)
            throw new InvalidOperationException($"Erro ao fazer upload da imagem: {result.Error.Message}");

        return (result.SecureUrl.ToString(), result.PublicId);
    }

    public async Task DeleteAsync(string publicId, CancellationToken cancellationToken = default)
    {
        var deletionParams = new DeletionParams(publicId);
        await _cloudinary.DestroyAsync(deletionParams);
    }
}
