# ---- build stage ----
FROM mcr.microsoft.com/dotnet/sdk:9.0-alpine AS build
WORKDIR /source

# Copy everything under server/ into image
COPY . .

# Your entry project is in /source/Startup
WORKDIR /source/Startup
RUN dotnet publish -c Release --no-self-contained -o /app

# ---- runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0-alpine AS final
WORKDIR /app

COPY --from=build /app .

# Fly commonly routes HTTP to internal_port (we’ll set 8080)
# ENV ASPNETCORE_URLS=http://+:8080

USER $APP_UID
EXPOSE 8080
CMD ["dotnet", "Startup.dll"]
