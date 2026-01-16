using JurisNexo.Core.Interfaces;
using Npgsql;

namespace JurisNexo.Infrastructure.External;

public class SupabaseClient : ISupabaseClient
{
    private readonly string _connectionString;

    public SupabaseClient(string connectionString)
    {
        _connectionString = connectionString;
    }

    public async Task<NpgsqlConnection> GetConnectionAsync()
    {
        var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        return connection;
    }
}

public interface ISupabaseClient
{
    Task<NpgsqlConnection> GetConnectionAsync();
}
