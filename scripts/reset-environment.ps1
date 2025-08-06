#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Resets the e-commerce application environment to a clean state
.DESCRIPTION
    This script cleans build artifacts, node_modules, temp files, and optionally git state
.PARAMETER Full
    Perform a full reset including git clean and dependency reinstall
.PARAMETER KeepDependencies
    Keep node_modules and NuGet packages (faster reset)
.PARAMETER GitReset
    Reset git working directory to clean state
.PARAMETER DryRun
    Show what would be deleted without actually deleting
#>

param(
    [switch]$Full,
    [switch]$KeepDependencies,
    [switch]$GitReset,
    [switch]$DryRun
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

function Remove-ItemSafely($Path, $Description) {
    if (Test-Path $Path) {
        if ($DryRun) {
            Write-ColorOutput "🔍 Would delete: $Path" $Yellow
        } else {
            Write-ColorOutput "🗑️ Removing $Description..." $Yellow
            Remove-Item -Recurse -Force $Path -ErrorAction Continue
            if (!(Test-Path $Path)) {
                Write-ColorOutput "✅ Removed $Description" $Green
            } else {
                Write-ColorOutput "⚠️ Failed to completely remove $Description" $Yellow
            }
        }
    } else {
        Write-ColorOutput "✅ $Description already clean" $Green
    }
}

function Stop-DevelopmentServers {
    Write-ColorOutput "🛑 Stopping development servers..." $Cyan
    
    if ($DryRun) {
        Write-ColorOutput "🔍 Would stop: dotnet processes on port 5217" $Yellow
        Write-ColorOutput "🔍 Would stop: node processes on port 3000" $Yellow
        return
    }
    
    # Stop backend processes
    try {
        $dotnetProcesses = Get-Process -Name "dotnet" -ErrorAction SilentlyContinue | Where-Object {
            $_.MainWindowTitle -like "*EcommerceApi*" -or 
            $_.ProcessName -eq "dotnet" -and $_.StartTime -gt (Get-Date).AddHours(-2)
        }
        
        foreach ($process in $dotnetProcesses) {
            Write-ColorOutput "🛑 Stopping .NET process (PID: $($process.Id))" $Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction Continue
        }
    }
    catch {
        Write-ColorOutput "⚠️ Could not stop some .NET processes" $Yellow
    }
    
    # Stop frontend processes
    try {
        $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.MainWindowTitle -like "*react*" -or
            $_.ProcessName -eq "node" -and $_.StartTime -gt (Get-Date).AddHours(-2)
        }
        
        foreach ($process in $nodeProcesses) {
            Write-ColorOutput "🛑 Stopping Node.js process (PID: $($process.Id))" $Yellow
            Stop-Process -Id $process.Id -Force -ErrorAction Continue
        }
    }
    catch {
        Write-ColorOutput "⚠️ Could not stop some Node.js processes" $Yellow
    }
    
    Write-ColorOutput "✅ Development servers stopped" $Green
}

function Clean-Backend {
    Write-ColorOutput "🧹 Cleaning Backend (.NET)..." $Cyan
    
    # Clean build artifacts
    Remove-ItemSafely "EcommerceApi\bin" "Backend build artifacts"
    Remove-ItemSafely "EcommerceApi\obj" "Backend object files"
    
    # Clean NuGet packages (if not keeping dependencies)
    if (!$KeepDependencies) {
        $nugetCache = "$env:USERPROFILE\.nuget\packages"
        if ($DryRun) {
            Write-ColorOutput "🔍 Would clear NuGet package cache: $nugetCache" $Yellow
        } else {
            try {
                dotnet nuget locals all --clear
                Write-ColorOutput "✅ NuGet cache cleared" $Green
            }
            catch {
                Write-ColorOutput "⚠️ Could not clear NuGet cache" $Yellow
            }
        }
    }
}

function Clean-Frontend {
    Write-ColorOutput "🧹 Cleaning Frontend (React)..." $Cyan
    
    # Clean build artifacts
    Remove-ItemSafely "ecommerce-frontend\build" "Frontend build artifacts"
    Remove-ItemSafely "ecommerce-frontend\.next" "Next.js cache (if any)"
    
    # Clean dependencies (if not keeping them)
    if (!$KeepDependencies) {
        Remove-ItemSafely "ecommerce-frontend\node_modules" "Frontend dependencies"
        Remove-ItemSafely "ecommerce-frontend\package-lock.json" "Package lock file"
    }
    
    # Clean npm cache
    if (!$KeepDependencies -and !$DryRun) {
        Write-ColorOutput "🧹 Clearing npm cache..." $Yellow
        npm cache clean --force
        Write-ColorOutput "✅ npm cache cleared" $Green
    }
}

function Clean-TempFiles {
    Write-ColorOutput "🧹 Cleaning Temporary Files..." $Cyan
    
    $tempPaths = @(
        "*.log",
        "*.tmp",
        ".DS_Store",
        "Thumbs.db",
        ".vscode\settings.json",
        ".vs",
        "*.user",
        "*.suo",
        "*.cache"
    )
    
    foreach ($pattern in $tempPaths) {
        $files = Get-ChildItem -Path "." -Filter $pattern -Recurse -Force -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            if ($DryRun) {
                Write-ColorOutput "🔍 Would delete: $($file.FullName)" $Yellow
            } else {
                Remove-Item $file.FullName -Force -ErrorAction Continue
            }
        }
    }
}

function Reset-GitState {
    Write-ColorOutput "🔄 Resetting Git State..." $Cyan
    
    if ($DryRun) {
        Write-ColorOutput "🔍 Would run: git clean -fdx" $Yellow
        Write-ColorOutput "🔍 Would run: git reset --hard HEAD" $Yellow
        return
    }
    
    try {
        # Clean untracked files
        Write-ColorOutput "🧹 Removing untracked files..." $Yellow
        git clean -fdx
        
        # Reset working directory
        Write-ColorOutput "🔄 Resetting working directory..." $Yellow
        git reset --hard HEAD
        
        Write-ColorOutput "✅ Git state reset" $Green
    }
    catch {
        Write-ColorOutput "⚠️ Git reset failed: $($_.Exception.Message)" $Yellow
    }
}

function Reinstall-Dependencies {
    Write-ColorOutput "📦 Reinstalling Dependencies..." $Cyan
    
    if ($DryRun) {
        Write-ColorOutput "🔍 Would run: dotnet restore" $Yellow
        Write-ColorOutput "🔍 Would run: npm install" $Yellow
        return
    }
    
    # Restore .NET packages
    try {
        Set-Location "EcommerceApi"
        Write-ColorOutput "📦 Restoring .NET packages..." $Yellow
        dotnet restore
        Write-ColorOutput "✅ .NET packages restored" $Green
        Set-Location ".."
    }
    catch {
        Write-ColorOutput "❌ Failed to restore .NET packages: $($_.Exception.Message)" $Red
        Set-Location ".."
    }
    
    # Install npm packages
    try {
        Set-Location "ecommerce-frontend"
        Write-ColorOutput "📦 Installing npm packages..." $Yellow
        npm install
        Write-ColorOutput "✅ npm packages installed" $Green
        Set-Location ".."
    }
    catch {
        Write-ColorOutput "❌ Failed to install npm packages: $($_.Exception.Message)" $Red
        Set-Location ".."
    }
}

function Show-ResetSummary {
    Write-ColorOutput "`n📋 Reset Summary" $Cyan
    Write-ColorOutput "================" $Cyan
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN - No changes were made" $Yellow
        Write-ColorOutput "📝 Run without -DryRun to perform actual reset" $Cyan
    } else {
        Write-ColorOutput "✅ Environment reset completed!" $Green
    }
    
    Write-ColorOutput "`n📊 What was cleaned:" $Cyan
    Write-ColorOutput "- Backend build artifacts (bin, obj)" $Yellow
    Write-ColorOutput "- Frontend build artifacts (build)" $Yellow
    Write-ColorOutput "- Temporary and cache files" $Yellow
    
    if (!$KeepDependencies) {
        Write-ColorOutput "- Dependencies (node_modules, NuGet cache)" $Yellow
    }
    
    if ($GitReset) {
        Write-ColorOutput "- Git working directory state" $Yellow
    }
    
    Write-ColorOutput "`n💡 Next Steps:" $Cyan
    if (!$KeepDependencies -and !$DryRun) {
        Write-ColorOutput "- Dependencies have been reinstalled" $Green
        Write-ColorOutput "- Ready to start development servers" $Green
    } else {
        Write-ColorOutput "- Run './scripts/start-dev.ps1' to start development servers" $Yellow
        Write-ColorOutput "- Run './scripts/build-all.ps1' to build for production" $Yellow
    }
}

# Main execution
try {
    Write-ColorOutput "🔄 E-commerce Environment Reset" $Cyan
    Write-ColorOutput "===============================" $Cyan
    
    if ($DryRun) {
        Write-ColorOutput "🔍 DRY RUN MODE - No changes will be made" $Yellow
    }
    
    Write-ColorOutput "Started at: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))`n" $Yellow
    
    # Validate parameters
    if ($Full) {
        $KeepDependencies = $false
        $GitReset = $true
    }
    
    # Stop running servers first
    Stop-DevelopmentServers
    Start-Sleep -Seconds 2  # Give processes time to stop
    
    # Clean components
    Clean-Backend
    Clean-Frontend
    Clean-TempFiles
    
    # Git reset if requested
    if ($GitReset) {
        Reset-GitState
    }
    
    # Reinstall dependencies if we removed them
    if (!$KeepDependencies -and !$DryRun) {
        Reinstall-Dependencies
    }
    
    Show-ResetSummary
    
    Write-ColorOutput "`n⏱️ Reset completed at: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))" $Cyan
}
catch {
    Write-ColorOutput "`n❌ Reset failed with error: $($_.Exception.Message)" $Red
    exit 1
}