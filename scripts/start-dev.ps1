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
    
    if (!(Test-Path "EcommerceApi/EcommerceApi.csproj")) {
        Write-ColorOutput "❌ Backend project not found at EcommerceApi/EcommerceApi.csproj" $Red
        return $false
    }
    
    Write-ColorOutput "📡 Backend will be available at: http://localhost:5217" $Green
    Write-ColorOutput "📚 Swagger UI will be available at: http://localhost:5217/swagger" $Green
    
    # Start the backend server with proper working directory
    $backendPath = Resolve-Path "EcommerceApi"
    Write-ColorOutput "🔧 Starting backend in: $backendPath" $Yellow
    
    try {
        if ($IsWindows -or $PSVersionTable.PSEdition -eq "Desktop") {
            # Windows - start in new console window
            Start-Process -FilePath "dotnet" -ArgumentList "run" -WorkingDirectory $backendPath -WindowStyle Normal
        } else {
            # Linux/Mac - start in background with nohup
            $null = Start-Process -FilePath "bash" -ArgumentList @("-c", "cd '$backendPath' && nohup dotnet run > ../backend.log 2>&1 &") -NoNewWindow
        }
        Write-ColorOutput "✅ Backend server starting..." $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to start backend: $($_.Exception.Message)" $Red
        return $false
    }
}

function Start-Frontend {
    Write-ColorOutput "🚀 Starting Frontend Development Server..." $Cyan
    
    if (!(Test-Path "ecommerce-frontend/package.json")) {
        Write-ColorOutput "❌ Frontend project not found at ecommerce-frontend/package.json" $Red
        return $false
    }
    
    $frontendPath = Resolve-Path "ecommerce-frontend"
    
    if (!$SkipInstall) {
        Write-ColorOutput "📦 Checking dependencies..." $Yellow
        if (!(Test-Path "ecommerce-frontend/node_modules") -or (Get-ChildItem "ecommerce-frontend/node_modules" -Force -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
            Write-ColorOutput "📦 Installing frontend dependencies..." $Yellow
            
            Set-Location "ecommerce-frontend"
            npm install
            $npmResult = $LASTEXITCODE
            Set-Location ".."
            
            if ($npmResult -ne 0) {
                Write-ColorOutput "❌ npm install failed!" $Red
                return $false
            }
        }
    }
    
    Write-ColorOutput "🌐 Frontend will be available at: http://localhost:3000" $Green
    Write-ColorOutput "🔧 Starting frontend in: $frontendPath" $Yellow
    
    try {
        # Set environment variable to prevent auto-opening browser
        $env:BROWSER = "none"
        
        if ($IsWindows -or $PSVersionTable.PSEdition -eq "Desktop") {
            # Windows - start in new console window
            Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory $frontendPath -WindowStyle Normal
        } else {
            # Linux/Mac - start in background
            $null = Start-Process -FilePath "bash" -ArgumentList @("-c", "cd '$frontendPath' && BROWSER=none nohup npm start > ../frontend.log 2>&1 &") -NoNewWindow
        }
        Write-ColorOutput "✅ Frontend server starting..." $Green
        return $true
    }
    catch {
        Write-ColorOutput "❌ Failed to start frontend: $($_.Exception.Message)" $Red
        return $false
    }
    finally {
        Remove-Item Env:BROWSER -ErrorAction SilentlyContinue
    }
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
    
    $maxWait = 45 # seconds - increased for slower systems
    $waited = 0
    $backendReady = $FrontendOnly
    $frontendReady = $BackendOnly
    
    while ((!$backendReady -or !$frontendReady) -and $waited -lt $maxWait) {
        Start-Sleep -Seconds 2
        $waited += 2
        
        # Check backend
        if (!$FrontendOnly -and !$backendReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:5217/swagger" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-ColorOutput "✅ Backend API is ready!" $Green
                    $backendReady = $true
                }
            }
            catch {
                # Still waiting
            }
        }
        
        # Check frontend
        if (!$BackendOnly -and !$frontendReady) {
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-ColorOutput "✅ Frontend is ready!" $Green
                    $frontendReady = $true
                }
            }
            catch {
                # Frontend might still be starting
                if ($waited -gt 15) {
                    # After 15 seconds, assume it's starting (React takes time)
                    Write-ColorOutput "⏳ Frontend is probably starting..." $Yellow
                }
            }
        }
        
        if ($waited % 10 -eq 0 -and $waited -gt 0) {
            Write-ColorOutput "⏳ Still waiting... ($waited/$maxWait seconds)" $Yellow
            
            if (!$backendReady -and !$FrontendOnly) {
                Write-ColorOutput "   Backend: Not ready yet" $Yellow
            }
            if (!$frontendReady -and !$BackendOnly) {
                Write-ColorOutput "   Frontend: Not ready yet" $Yellow
            }
        }
    }
    
    if ($waited -ge $maxWait) {
        Write-ColorOutput "⚠️ Timeout reached. Servers may still be starting up." $Yellow
        Write-ColorOutput "💡 Check the new console windows or log files for status" $Cyan
        
        if (!$BackendOnly -and !$FrontendOnly) {
            if (Test-Path "backend.log") {
                Write-ColorOutput "📋 Backend log: backend.log" $Yellow
            }
            if (Test-Path "frontend.log") {
                Write-ColorOutput "📋 Frontend log: frontend.log" $Yellow
            }
        }
    }
    
    return @{
        BackendReady = $backendReady
        FrontendReady = $frontendReady
    }
}

# Main execution
try {
    Write-ColorOutput "🚀 Starting E-commerce Development Environment..." $Cyan
    Write-ColorOutput "Working Directory: $(Get-Location)" $Yellow
    
    if ($BackendOnly -and $FrontendOnly) {
        Write-ColorOutput "❌ Cannot use both -BackendOnly and -FrontendOnly flags" $Red
        exit 1
    }
    
    Test-Ports
    
    $backendStarted = $true
    $frontendStarted = $true
    
    if (!$FrontendOnly) {
        Write-ColorOutput "`n🔧 Starting backend..." $Cyan
        $backendStarted = Start-Backend
        if ($backendStarted) {
            Start-Sleep -Seconds 3  # Give backend a moment to start
        } else {
            Write-ColorOutput "❌ Backend failed to start" $Red
        }
    }
    
    if (!$BackendOnly) {
        Write-ColorOutput "`n🔧 Starting frontend..." $Cyan  
        $frontendStarted = Start-Frontend
        if (!$frontendStarted) {
            Write-ColorOutput "❌ Frontend failed to start" $Red
        }
    }
    
    # Only wait for servers if they were started successfully
    if (($FrontendOnly -or $backendStarted) -and ($BackendOnly -or $frontendStarted)) {
        $serverStatus = Wait-ForServers
        Show-StartupInfo
        
        Write-ColorOutput "`n📊 Startup Summary:" $Cyan
        if (!$FrontendOnly) {
            $backendStatus = if ($serverStatus.BackendReady) { "✅ Ready" } else { "⏳ Starting" }
            Write-ColorOutput "Backend: $backendStatus" $(if ($serverStatus.BackendReady) { $Green } else { $Yellow })
        }
        if (!$BackendOnly) {
            $frontendStatus = if ($serverStatus.FrontendReady) { "✅ Ready" } else { "⏳ Starting" }
            Write-ColorOutput "Frontend: $frontendStatus" $(if ($serverStatus.FrontendReady) { $Green } else { $Yellow })
        }
        
        Write-ColorOutput "`n🎉 Development environment started!" $Green
        Write-ColorOutput "💡 Servers are running in separate windows/processes" $Cyan
        Write-ColorOutput "💡 Use Ctrl+C in each window to stop the servers" $Yellow
        Write-ColorOutput "💡 Run './scripts/health-check.ps1' to verify everything is working" $Cyan
        
        Write-ColorOutput "`nPress any key to exit this script (servers will continue running)..." $Yellow
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    } else {
        Write-ColorOutput "`n❌ Failed to start one or more services" $Red
        Write-ColorOutput "💡 Check the error messages above for details" $Yellow
        exit 1
    }
}
catch {
    Write-ColorOutput "`n❌ Failed to start development environment: $($_.Exception.Message)" $Red
    Write-ColorOutput "💡 Check that you're in the project root directory" $Yellow
    Write-ColorOutput "💡 Verify .NET and Node.js are installed: './scripts/health-check.ps1'" $Cyan
    exit 1
}