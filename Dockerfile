# Dockerfile — build & runtime for ASP.NET Core backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# copy csproj and restore first for caching
COPY . .
RUN dotnet restore "./dmf-music-platform.Web/dmf-music-platform.Web.Api.csproj"
RUN dotnet publish "./dmf-music-platform.Web/dmf-music-platform.Web.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "dmf-music-platform.Web.Api.dll"]
