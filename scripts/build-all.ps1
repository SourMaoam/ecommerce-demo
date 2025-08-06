#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Builds both frontend and backend components of the e-commerce application
.DESCRIPTION
    This script builds the .NET backend API and React frontend, with error handling and logging
.PARAMETER Clean
    Whether to clean build artifacts before building (default: true)
.PARAMETER Configuration
    Build configuration: Debug or Release (default: Release)
#>

param(
    [bool]$Clean = $true,
    [string]$Configuration = "Release"
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorOutput($Message, $Color = [System.ConsoleColor]::White) {
    Write-Host $Message -ForegroundColor $Color
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking prerequisites..." $Cyan
    
    # Check .NET
    try {
        $dotnetVersion = dotnet --version
        Write-ColorOutput "✅ .NET SDK: $dotnetVersion" $Green
    }
    catch {
        Write-ColorOutput "❌ .NET SDK not found. Please install .NET 9.0 SDK" $Red
        exit 1
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        Write-ColorOutput "✅ Node.js: $nodeVersion, npm: $npmVersion" $Green
    }
    catch {
        Write-ColorOutput "❌ Node.js/npm not found. Please install Node.js 18+" $Red
        exit 1
    }
}

function Build-Backend {
    Write-ColorOutput "🏗️ Building Backend API (.NET)..." $Cyan
    
    if (!(Test-Path "EcommerceApi/EcommerceApi.csproj")) {
        Write-ColorOutput "❌ Backend project not found at EcommerceApi/EcommerceApi.csproj" $Red
        exit 1
    }
    
    try {
        Set-Location "EcommerceApi"
        
        if ($Clean) {
            Write-ColorOutput "🧹 Cleaning backend..." $Yellow
            dotnet clean --configuration $Configuration
        }
        
        Write-ColorOutput "📦 Restoring backend packages..." $Yellow
        dotnet restore
        
        Write-ColorOutput "🔨 Building backend..." $Yellow
        dotnet build --configuration $Configuration --no-restore
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Backend build failed!" $Red
            throw "Backend build failed with exit code $LASTEXITCODE"
        }
        
        Write-ColorOutput "✅ Backend build completed successfully!" $Green
    }
    finally {
        Set-Location ".."
    }
}

function Build-Frontend {
    Write-ColorOutput "🏗️ Building Frontend React App..." $Cyan
    
    if (!(Test-Path "ecommerce-frontend/package.json")) {
        Write-ColorOutput "❌ Frontend project not found at ecommerce-frontend/package.json" $Red
        exit 1
    }
    
    try {
        Set-Location "ecommerce-frontend"
        
        if ($Clean -and (Test-Path "build")) {
            Write-ColorOutput "🧹 Cleaning frontend build directory..." $Yellow
            Remove-Item -Recurse -Force "build"
        }
        
        if ($Clean -and (Test-Path "node_modules")) {
            Write-ColorOutput "🧹 Cleaning node_modules..." $Yellow
            Remove-Item -Recurse -Force "node_modules"
        }
        
        Write-ColorOutput "📦 Installing frontend dependencies..." $Yellow
        npm install
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ npm install failed!" $Red
            throw "npm install failed with exit code $LASTEXITCODE"
        }
        
        Write-ColorOutput "🔨 Building frontend for production..." $Yellow
        npm run build
        
        if ($LASTEXITCODE -ne 0) {
            Write-ColorOutput "❌ Frontend build failed!" $Red
            throw "Frontend build failed with exit code $LASTEXITCODE"
        }
        
        Write-ColorOutput "✅ Frontend build completed successfully!" $Green
    }
    finally {
        Set-Location ".."
    }
}

function Show-BuildSummary {
    Write-ColorOutput "`n📋 Build Summary:" $Cyan
    Write-ColorOutput "=================" $Cyan
    
    # Backend summary
    if (Test-Path "EcommerceApi\bin\$Configuration") {
        $backendSize = (Get-ChildItem "EcommerceApi\bin\$Configuration" -Recurse | Measure-Object -Property Length -Sum).Sum
        Write-ColorOutput "🚀 Backend: Built successfully ($([math]::Round($backendSize/1MB, 2)) MB)" $Green
    }
    
    # Frontend summary
    if (Test-Path "ecommerce-frontend\build") {
        $frontendSize = (Get-ChildItem "ecommerce-frontend\build" -Recurse | Measure-Object -Property Length -Sum).Sum
        Write-ColorOutput "🚀 Frontend: Built successfully ($([math]::Round($frontendSize/1MB, 2)) MB)" $Green
    }
    
    Write-ColorOutput "`n🎉 All builds completed successfully!" $Green
    Write-ColorOutput "⚡ Ready for deployment or testing!" $Yellow
}

# Main execution
try {
    $startTime = Get-Date
    Write-ColorOutput "🚀 Starting E-commerce Application Build Process..." $Cyan
    Write-ColorOutput "Working Directory: $(Get-Location)" $Yellow
    Write-ColorOutput "Configuration: $Configuration, Clean: $Clean" $Yellow
    Write-ColorOutput "Started at: $($startTime.ToString('yyyy-MM-dd HH:mm:ss'))`n" $Yellow
    
    # Validate we're in the correct directory
    if (!(Test-Path "EcommerceApi") -and !(Test-Path "ecommerce-frontend")) {
        Write-ColorOutput "❌ Not in project root directory. Expected to find EcommerceApi and ecommerce-frontend folders." $Red
        Write-ColorOutput "💡 Navigate to the project root directory and try again." $Yellow
        exit 1
    }
    
    Test-Prerequisites
    Build-Backend
    Build-Frontend
    Show-BuildSummary
    
    $endTime = Get-Date
    $duration = $endTime - $startTime
    Write-ColorOutput "`n⏱️ Total build time: $($duration.ToString('mm\:ss'))" $Cyan
}
catch {
    Write-ColorOutput "`n❌ Build failed with error: $($_.Exception.Message)" $Red
    Write-ColorOutput "💡 Check the error messages above for details" $Yellow
    Write-ColorOutput "💡 Ensure you're in the project root directory" $Cyan
    exit 1
}