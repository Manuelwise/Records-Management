# Setup script for Records Management System

Write-Host "Setting up Records Management System..." -ForegroundColor Green

# Create backend directories
$backendDirs = @(
    "backend/src/controllers",
    "backend/src/models",
    "backend/src/routes",
    "backend/src/middleware",
    "backend/src/utils",
    "backend/src/config"
)

foreach ($dir in $backendDirs) {
    New-Item -ItemType Directory -Force -Path $dir
    Write-Host "Created directory: $dir" -ForegroundColor Yellow
}

# Create frontend directories
$frontendDirs = @(
    "frontend/src/components",
    "frontend/src/pages",
    "frontend/src/services",
    "frontend/src/context",
    "frontend/src/utils"
)

foreach ($dir in $frontendDirs) {
    New-Item -ItemType Directory -Force -Path $dir
    Write-Host "Created directory: $dir" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "Installing backend dependencies..." -ForegroundColor Green
Set-Location backend
npm install

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Green
Set-Location ../frontend
npm install

Write-Host "Setup complete!" -ForegroundColor Green
Write-Host "Please configure your .env files and database connections before starting the application." -ForegroundColor Yellow
