FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution and project files
COPY ["src/JurisNexo.API/JurisNexo.API.csproj", "JurisNexo.API/"]
COPY ["src/JurisNexo.Application/JurisNexo.Application.csproj", "JurisNexo.Application/"]
COPY ["src/JurisNexo.Domain/JurisNexo.Domain.csproj", "JurisNexo.Domain/"]
COPY ["src/JurisNexo.Infrastructure/JurisNexo.Infrastructure.csproj", "JurisNexo.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "JurisNexo.API/JurisNexo.API.csproj"

# Copy source code
COPY src/ .

# Build
WORKDIR "/src/JurisNexo.API"
RUN dotnet build "JurisNexo.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "JurisNexo.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Create non-root user
RUN groupadd -r jurisnexo && useradd -r -g jurisnexo jurisnexo
RUN chown -R jurisnexo:jurisnexo /app
USER jurisnexo

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/health || exit 1

ENTRYPOINT ["dotnet", "JurisNexo.API.dll"]
