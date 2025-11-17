FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8443
ENV ASPNETCORE_URLS=http://+:8080

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY "dmf-music-platform.sln" .
COPY "dmf-music-platform.Web/dmf-music-platform.Web.csproj" "dmf-music-platform.Web/"
COPY "dmf-music-platform.Shared/dmf-music-platform.Shared.csproj" "dmf-music-platform.Shared/"

# Restore dependencies
RUN dotnet restore "dmf-music-platform.sln"

# Copy remaining source code
COPY "dmf-music-platform.Web/" "dmf-music-platform.Web/"
COPY "dmf-music-platform.Shared/" "dmf-music-platform.Shared/"

# Build
WORKDIR "/src/dmf-music-platform.Web"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "dmf-music-platform.Web.dll"]
