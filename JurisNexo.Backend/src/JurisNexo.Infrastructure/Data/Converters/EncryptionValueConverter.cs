using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Security.Cryptography;
using System.Text;

namespace JurisNexo.Infrastructure.Data.Converters;

public class EncryptionValueConverter : ValueConverter<string, string>
{
    // Hardcoded for MVP/Demo purposes. In production, rotate keys and use Key Vault.
    // Ensure this key is 32 bytes for AES-256.
    private const string Key = "JURISNEXO_SECURE_KEY_2026_!@#$%^"; 

    public EncryptionValueConverter(ConverterMappingHints? mappingHints = null) 
        : base(v => Encrypt(v), v => Decrypt(v), mappingHints)
    {
    }

    private static string Encrypt(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        
        var iv = new byte[16];
        using var aes = Aes.Create();
        aes.Key = Encoding.UTF8.GetBytes(Key);
        aes.GenerateIV();
        iv = aes.IV;

        var encryptor = aes.CreateEncryptor(aes.Key, aes.IV);
        using var ms = new MemoryStream();
        using (var cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
        using (var sw = new StreamWriter(cs))
        {
            sw.Write(value);
        }

        var encryptedContent = ms.ToArray();
        
        // Return IV + Encrypted Data as Base64
        var result = new byte[iv.Length + encryptedContent.Length];
        Buffer.BlockCopy(iv, 0, result, 0, iv.Length);
        Buffer.BlockCopy(encryptedContent, 0, result, iv.Length, encryptedContent.Length);

        return Convert.ToBase64String(result);
    }

    private static string Decrypt(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;

        try
        {
            var fullCipher = Convert.FromBase64String(value);
            var iv = new byte[16];
            var cipher = new byte[fullCipher.Length - iv.Length];

            Buffer.BlockCopy(fullCipher, 0, iv, 0, iv.Length);
            Buffer.BlockCopy(fullCipher, iv.Length, cipher, 0, cipher.Length);

            using var aes = Aes.Create();
            aes.Key = Encoding.UTF8.GetBytes(Key);
            aes.IV = iv;

            var decryptor = aes.CreateDecryptor(aes.Key, aes.IV);
            using var ms = new MemoryStream(cipher);
            using var cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read);
            using var sr = new StreamReader(cs);
            
            return sr.ReadToEnd();
        }
        catch
        {
            // Fallback for unencrypted legacy data
            return value;
        }
    }
}
