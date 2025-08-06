#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Starts both backend and frontend development servers concurrently
.DESCRIPTION
    This script starts the .NET API on port 5217 and React dev server on port 3000 in parallel
.PARAMETER BackendOnly
    Only start the backend server
.PARAMETER FrontendOnly
    Only start the frontend server
.PARAMETER SkipInstall
    Skip npm install check for faster startup
#>

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorOutput($Message, $Color = [System.ConsoleColor]::White) {
    Write-Host $Message -ForegroundColor $Color
}

function Test-Ports {
    Write-ColorOutput "🔍 Checking port availability..." $Cyan
    
    $backendPort = 5217
    $frontendPort = 3000
    
    # Check backend port
    if (!$FrontendOnly) {
        try {
            $backendListener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object {$_.Port -eq $backendPort}
            if ($backendListener) {
                Write-ColorOutput "⚠️ Port $backendPort is already in use. Backend may already be running." $Yellow
            }
        }
        catch {
            # Port check failed, continue anyway
        }
    }
    
    # Check frontend port
    if (!$BackendOnly) {
        try {
            $frontendListener = [System.Net.NetworkInformation.IPGlobalProperties]::GetIPGlobalProperties().GetActiveTcpListeners() | Where-Object {$_.Port -eq $frontendPort}
            if ($frontendListener) {
                Write-ColorOutput "⚠️ Port $frontendPort is already in use. Frontend may already be running." $Yellow
            }
        }
        catch {
            # Port check failed, continue anyway
        }
    }
}

function Start-Backend {
    Write-ColorOutput "🚀 Starting Backend API Server..." $Cyan
    
    Set-Location "EcommerceApi"
    
    Write-ColorOutput "📡 Backend will be available at: http://localhost:5217" $Green
    Write-ColorOutput "📚 Swagger UI will be available at: http://localhost:5217/swagger" $Green
    
    # Start the backend server
    Start-Process -FilePath "dotnet" -ArgumentList "run" -WindowStyle Normal
    
    Set-Location ".."
}

function Start-Frontend {
    Write-ColorOutput "🚀 Starting Frontend Development Server..." $Cyan
    
    Set-Location "ecommerce-frontend"
    
    if (!$SkipInstall) {
        Write-ColorOutput "📦 Checking dependencies..." $Yellow
        if (!(Test-Path "node_modules") -or (Get-ChildItem "node_modules" -Force | Measure-Object).Count -eq 0) {
            Write-ColorOutput "📦 Installing frontend dependencies..." $Yellow
            npm install
            if ($LASTEXITCODE -ne 0) {
                Write-ColorOutput "❌ npm install failed!" $Red
                Set-Location ".."
                exit 1
            }
        }
    }
    
    Write-ColorOutput "🌐 Frontend will be available at: http://localhost:3000" $Green
    
    # Set environment variable to open browser automatically
    $env:BROWSER = "none"  # Prevent auto-opening browser in Windows
    
    # Start the frontend server
    Start-Process -FilePath "npm" -ArgumentList "start" -WindowStyle Normal
    
    Set-Location ".."
}

function Show-StartupInfo {
    Write-ColorOutput "`n🎯 Development Servers Started!" $Green
    Write-ColorOutput "===============================" $Green
    
    if (!$FrontendOnly) {
        Write-ColorOutput "🔧 Backend API: http://localhost:5217" $Cyan
        Write-ColorOutput "📖 API Documentation: http://localhost:5217/swagger" $Cyan
    }
    
    if (!$BackendOnly) {
        Write-ColorOutput "🌐 Frontend App: http://localhost:3000" $Cyan
    }
    
    Write-ColorOutput "`n💡 Tips:" $Yellow
    Write-ColorOutput "- Both servers will automatically reload on code changes" $Yellow
    Write-ColorOutput "- Press Ctrl+C in each terminal to stop the servers" $Yellow
    Write-ColorOutput "- Check the console output for any errors or warnings" $Yellow
    
    if (!$BackendOnly -and !$FrontendOnly) {
        Write-ColorOutput "- The frontend is configured to proxy API requests to the backend" $Yellow
    }
}

function Wait-ForServers {
    Write-ColorOutput "`n⏳ Waiting for servers to start..." $Cyan
    
    $maxWait = 30 # seconds
    $waited = 0
    $backendReady = $FrontendOnly
    $frontendReady = $BackendOnly
    
    while ((!$backendReady -or !$frontendReady) -and $waited -lt $maxWait) {
        Start-Sleep -Seconds 1
        $waited++
        
        # Check backend
        if (!$FrontendOnly -and !$backendReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:5217/swagger" -Method GET -TimeoutSec 1 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-ColorOutput "✅ Backend API is ready!" $Green
                    $backendReady = $true
                }
            }
            catch {
                # Still waiting
            }
        }
        
        # Check frontend (harder to detect, just wait a bit)
        if (!$BackendOnly -and !$frontendReady -and $waited -gt 10) {
            Write-ColorOutput "✅ Frontend should be ready!" $Green
            $frontendReady = $true
        }
        
        if ($waited % 5 -eq 0) {
            Write-ColorOutput "⏳ Still waiting... ($waited/$maxWait seconds)" $Yellow
        }
    }
    
    if ($waited -ge $maxWait) {
        Write-ColorOutput "⚠️ Servers may still be starting up. Check the console windows for status." $Yellow
    }
}

# Main execution
try {
    Write-ColorOutput "🚀 Starting E-commerce Development Environment..." $Cyan
    
    if ($BackendOnly -and $FrontendOnly) {
        Write-ColorOutput "❌ Cannot use both -BackendOnly and -FrontendOnly flags" $Red
        exit 1
    }
    
    Test-Ports
    
    if (!$FrontendOnly) {
        Start-Backend
        Start-Sleep -Seconds 2  # Give backend a moment to start
    }
    
    if (!$BackendOnly) {
        Start-Frontend
    }
    
    Wait-ForServers
    Show-StartupInfo
    
    Write-ColorOutput "`n🎉 Development environment is ready!" $Green
    Write-ColorOutput "Press any key to exit this script (servers will continue running)..." $Yellow
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
catch {
    Write-ColorOutput "`n❌ Failed to start development environment: $($_.Exception.Message)" $Red
    exit 1
}