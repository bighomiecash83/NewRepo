# Build stage
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY ["DMF-MUSIC-PLATFORM/DMF-MUSIC-PLATFORM.csproj", "DMF-MUSIC-PLATFORM/"]
COPY ["DMF-MUSIC-PLATFORM.Client/DMF-MUSIC-PLATFORM.Client.csproj", "DMF-MUSIC-PLATFORM.Client/"]

# Restore dependencies
RUN dotnet restore "DMF-MUSIC-PLATFORM/DMF-MUSIC-PLATFORM.csproj"

# Copy all source
COPY . .

# Build
WORKDIR "/src/DMF-MUSIC-PLATFORM"
RUN dotnet build "DMF-MUSIC-PLATFORM.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "DMF-MUSIC-PLATFORM.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port
EXPOSE 8080

# Set environment variable for ASP.NET Core
ENV ASPNETCORE_URLS=http://+:8080

# Run the app
ENTRYPOINT ["dotnet", "DMF-MUSIC-PLATFORM.dll"]
