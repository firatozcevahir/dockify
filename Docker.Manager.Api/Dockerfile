#See https://aka.ms/containerfastmode to understand how Visual Studio uses this Dockerfile to build your images for faster debugging.

FROM mcr.microsoft.com/dotnet/aspnet:5.0-buster-slim AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:5.0-buster-slim AS build
WORKDIR /src
COPY ["Docker.Manager.Api/Dockify.Api.csproj", "Docker.Manager.Api/"]
COPY ["Docker.Manager.Infrastructure/Dockify.Infrastructure.csproj", "Docker.Manager.Infrastructure/"]
COPY ["Docker.Manager.Core/Dockify.Core.csproj", "Docker.Manager.Core/"]
COPY ["UnitOfWork/UnitOfWork.csproj", "UnitOfWork/"]
COPY ["Docker.Manager.Model/Dockify.Model.csproj", "Docker.Manager.Model/"]

COPY NuGet.Config ./
RUN dotnet restore --configfile NuGet.Config "Docker.Manager.Api/Dockify.Api.csproj"

COPY . .
WORKDIR "/src/Docker.Manager.Api"
RUN dotnet build "Dockify.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Dockify.Api.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Dockify.Api.dll"]