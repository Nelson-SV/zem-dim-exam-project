# scaffold.ps1
# Load variables from .env and scaffold DbContext & entities

# 1. Locate the .env file next to this script
$envFile = Join-Path $PSScriptRoot ".env"

if (-not (Test-Path $envFile)) {
    Write-Error ".env file not found at $envFile"
    exit 1
}

# 2. Parse .env and push values into environment variables
Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#")) {
        $parts = $line -split "=", 2
        if ($parts.Count -eq 2) {
            $key = $parts[0].Trim()
            $value = $parts[1].Trim()
            # remove surrounding quotes if present
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            }

            # This is the key fix:
            Set-Item -Path "Env:$key" -Value $value
        }
    }
}

if (-not $env:CONN_STR) {
    Write-Error "CONN_STR is not set in .env"
    exit 1
}

Write-Host "Using CONN_STR = $($env:CONN_STR)"

# 3. Invoke dotnet ef
dotnet ef dbcontext scaffold `
    "$env:CONN_STR" `
    Npgsql.EntityFrameworkCore.PostgreSQL `
    --output-dir ../Core.Domain/Entities `
    --context-dir . `
    --context AppDbContext `
    --no-onconfiguring `
    --namespace Core.Domain.Entities `
    --context-namespace Infrastructure.Postgres.Scaffolding `
    --schema public `
    --force
