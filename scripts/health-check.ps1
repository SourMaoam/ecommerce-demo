#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Performs health checks on the e-commerce application environment
.DESCRIPTION
    This script checks the health of both backend and frontend services, dependencies, and environment
.PARAMETER Detailed
    Show detailed information about each check
.PARAMETER FixIssues
    Attempt to automatically fix common issues
#>

param(
    [switch]$Detailed,
    [switch]$FixIssues
)

$ErrorActionPreference = "SilentlyContinue"

# Colors for output
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColorOutput($Message, $Color = [System.ConsoleColor]::White) {
    Write-Host $Message -ForegroundColor $Color
}

function Write-CheckResult($Name, $Status, $Details = "") {
    $icon = if ($Status) { "✅" } else { "❌" }
    $color = if ($Status) { $Green } else { $Red }
    
    Write-ColorOutput "$icon $Name" $color
    
    if ($Detailed -and $Details) {
        Write-ColorOutput "   $Details" $Yellow
    }
}

function Test-Prerequisites {
    Write-ColorOutput "🔍 Checking Prerequisites..." $Cyan
    Write-ColorOutput "===========================" $Cyan
    
    $results = @{}
    
    # Check .NET SDK
    try {
        $dotnetVersion = dotnet --version
        $results.DotNet = $true
        Write-CheckResult ".NET SDK" $true "Version: $dotnetVersion"
    }
    catch {
        $results.DotNet = $false
        Write-CheckResult ".NET SDK" $false "Not installed or not in PATH"
        
        if ($FixIssues) {
            Write-ColorOutput "🔧 To fix: Download and install .NET 9.0 SDK from https://dotnet.microsoft.com/download" $Yellow
        }
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        $npmVersion = npm --version
        $results.NodeJs = $true
        Write-CheckResult "Node.js & npm" $true "Node: $nodeVersion, npm: $npmVersion"
    }
    catch {
        $results.NodeJs = $false
        Write-CheckResult "Node.js & npm" $false "Not installed or not in PATH"
        
        if ($FixIssues) {
            Write-ColorOutput "🔧 To fix: Download and install Node.js 18+ from https://nodejs.org" $Yellow
        }
    }
    
    # Check Git
    try {
        $gitVersion = git --version
        $results.Git = $true
        Write-CheckResult "Git" $true "$gitVersion"
    }
    catch {
        $results.Git = $false
        Write-CheckResult "Git" $false "Not installed or not in PATH"
    }
    
    return $results
}

function Test-ProjectStructure {
    Write-ColorOutput "`n🏗️ Checking Project Structure..." $Cyan
    Write-ColorOutput "=================================" $Cyan
    
    $results = @{}
    
    # Check backend project
    $backendExists = Test-Path "EcommerceApi\EcommerceApi.csproj"
    $results.BackendProject = $backendExists
    Write-CheckResult "Backend Project (EcommerceApi)" $backendExists
    
    if ($backendExists -and $Detailed) {
        $backendFiles = @(
            "EcommerceApi\Program.cs",
            "EcommerceApi\appsettings.json"
        )
        foreach ($file in $backendFiles) {
            $exists = Test-Path $file
            Write-CheckResult "  - $(Split-Path $file -Leaf)" $exists
        }
    }
    
    # Check frontend project
    $frontendExists = Test-Path "ecommerce-frontend\package.json"
    $results.FrontendProject = $frontendExists
    Write-CheckResult "Frontend Project (ecommerce-frontend)" $frontendExists
    
    if ($frontendExists -and $Detailed) {
        $frontendFiles = @(
            "ecommerce-frontend\src\App.js",
            "ecommerce-frontend\public\index.html"
        )
        foreach ($file in $frontendFiles) {
            $exists = Test-Path $file
            Write-CheckResult "  - $(Split-Path $file -Leaf)" $exists
        }
    }
    
    # Check dependencies
    if ($frontendExists) {
        $nodeModulesExists = Test-Path "ecommerce-frontend\node_modules"
        $results.FrontendDependencies = $nodeModulesExists
        Write-CheckResult "Frontend Dependencies (node_modules)" $nodeModulesExists
        
        if (!$nodeModulesExists -and $FixIssues) {
            Write-ColorOutput "🔧 Installing frontend dependencies..." $Yellow
            Set-Location "ecommerce-frontend"
            npm install
            Set-Location ".."
            
            if ($LASTEXITCODE -eq 0) {
                Write-ColorOutput "✅ Frontend dependencies installed!" $Green
                $results.FrontendDependencies = $true
            }
        }
    }
    
    return $results
}

function Test-ServiceHealth {
    Write-ColorOutput "`n🚀 Checking Service Health..." $Cyan
    Write-ColorOutput "=============================" $Cyan
    
    $results = @{}
    
    # Check backend API
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5217/swagger" -Method GET -TimeoutSec 5
        $results.BackendService = ($response.StatusCode -eq 200)
        Write-CheckResult "Backend API (http://localhost:5217)" $results.BackendService "Response: $($response.StatusCode)"
        
        if ($results.BackendService -and $Detailed) {
            # Test API endpoints
            try {
                $productsResponse = Invoke-WebRequest -Uri "http://localhost:5217/api/products" -Method GET -TimeoutSec 5
                Write-CheckResult "  - Products API" ($productsResponse.StatusCode -eq 200) "Status: $($productsResponse.StatusCode)"
            }
            catch {
                Write-CheckResult "  - Products API" $false "Failed to connect"
            }
        }
    }
    catch {
        $results.BackendService = $false
        Write-CheckResult "Backend API (http://localhost:5217)" $false "Service not running or unreachable"
    }
    
    # Check frontend service
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
        $results.FrontendService = ($response.StatusCode -eq 200)
        Write-CheckResult "Frontend App (http://localhost:3000)" $results.FrontendService "Response: $($response.StatusCode)"
    }
    catch {
        $results.FrontendService = $false
        Write-CheckResult "Frontend App (http://localhost:3000)" $false "Service not running or unreachable"
    }
    
    return $results
}

function Test-BuildArtifacts {
    Write-ColorOutput "`n📦 Checking Build Artifacts..." $Cyan
    Write-ColorOutput "==============================" $Cyan
    
    $results = @{}
    
    # Check backend build
    $backendBuild = Test-Path "EcommerceApi\bin\Debug\net9.0\EcommerceApi.dll"
    $results.BackendBuild = $backendBuild
    Write-CheckResult "Backend Build Artifacts" $backendBuild
    
    if ($backendBuild -and $Detailed) {
        $buildInfo = Get-Item "EcommerceApi\bin\Debug\net9.0\EcommerceApi.dll"
        Write-CheckResult "  - Build Date" $true "$(($buildInfo.LastWriteTime).ToString('yyyy-MM-dd HH:mm:ss'))"
        Write-CheckResult "  - File Size" $true "$([math]::Round($buildInfo.Length/1KB, 2)) KB"
    }
    
    # Check frontend build
    $frontendBuild = Test-Path "ecommerce-frontend\build\index.html"
    $results.FrontendBuild = $frontendBuild
    Write-CheckResult "Frontend Build Artifacts" $frontendBuild
    
    if ($frontendBuild -and $Detailed) {
        $buildInfo = Get-Item "ecommerce-frontend\build\index.html"
        Write-CheckResult "  - Build Date" $true "$(($buildInfo.LastWriteTime).ToString('yyyy-MM-dd HH:mm:ss'))"
        
        $buildSize = (Get-ChildItem "ecommerce-frontend\build" -Recurse | Measure-Object -Property Length -Sum).Sum
        Write-CheckResult "  - Total Size" $true "$([math]::Round($buildSize/1MB, 2)) MB"
    }
    
    return $results
}

function Test-NetworkConnectivity {
    Write-ColorOutput "`n🌐 Checking Network Connectivity..." $Cyan
    Write-ColorOutput "===================================" $Cyan
    
    $results = @{}
    
    # Check internet connectivity
    try {
        $response = Invoke-WebRequest -Uri "https://www.google.com" -Method HEAD -TimeoutSec 5
        $results.Internet = ($response.StatusCode -eq 200)
        Write-CheckResult "Internet Connectivity" $results.Internet
    }
    catch {
        $results.Internet = $false
        Write-CheckResult "Internet Connectivity" $false "Cannot reach external sites"
    }
    
    # Check npm registry
    if ($results.Internet) {
        try {
            $response = Invoke-WebRequest -Uri "https://registry.npmjs.org" -Method HEAD -TimeoutSec 5
            $results.NpmRegistry = ($response.StatusCode -eq 200)
            Write-CheckResult "npm Registry" $results.NpmRegistry
        }
        catch {
            $results.NpmRegistry = $false
            Write-CheckResult "npm Registry" $false "Cannot reach npm registry"
        }
    }
    
    # Check NuGet
    if ($results.Internet) {
        try {
            $response = Invoke-WebRequest -Uri "https://api.nuget.org/v3/index.json" -Method GET -TimeoutSec 5
            $results.NuGet = ($response.StatusCode -eq 200)
            Write-CheckResult "NuGet Repository" $results.NuGet
        }
        catch {
            $results.NuGet = $false
            Write-CheckResult "NuGet Repository" $false "Cannot reach NuGet"
        }
    }
    
    return $results
}

function Show-HealthSummary($AllResults) {
    Write-ColorOutput "`n📊 Health Check Summary" $Cyan
    Write-ColorOutput "=======================" $Cyan
    
    $totalChecks = 0
    $passedChecks = 0
    
    foreach ($category in $AllResults.Keys) {
        foreach ($check in $AllResults[$category].Keys) {
            $totalChecks++
            if ($AllResults[$category][$check]) {
                $passedChecks++
            }
        }
    }
    
    $healthPercent = [math]::Round(($passedChecks / $totalChecks) * 100, 1)
    
    Write-ColorOutput "Health Score: $passedChecks/$totalChecks ($healthPercent%)" $(if ($healthPercent -ge 80) { $Green } elseif ($healthPercent -ge 60) { $Yellow } else { $Red })
    
    if ($healthPercent -lt 100) {
        Write-ColorOutput "`n❌ Issues Found:" $Red
        foreach ($category in $AllResults.Keys) {
            foreach ($check in $AllResults[$category].Keys) {
                if (!$AllResults[$category][$check]) {
                    Write-ColorOutput "   - $check" $Red
                }
            }
        }
        
        if ($FixIssues) {
            Write-ColorOutput "`n🔧 Run with -FixIssues to attempt automatic repairs" $Yellow
        }
    } else {
        Write-ColorOutput "`n🎉 All health checks passed! System is ready." $Green
    }
}

# Main execution
try {
    Write-ColorOutput "🏥 E-commerce Application Health Check" $Cyan
    Write-ColorOutput "=======================================" $Cyan
    Write-ColorOutput "Started at: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))`n" $Yellow
    
    $allResults = @{}
    $allResults.Prerequisites = Test-Prerequisites
    $allResults.ProjectStructure = Test-ProjectStructure
    $allResults.ServiceHealth = Test-ServiceHealth
    $allResults.BuildArtifacts = Test-BuildArtifacts
    $allResults.NetworkConnectivity = Test-NetworkConnectivity
    
    Show-HealthSummary $allResults
    
    Write-ColorOutput "`n💡 Tip: Use -Detailed for more information, -FixIssues to auto-repair common problems" $Yellow
}
catch {
    Write-ColorOutput "`n❌ Health check failed with error: $($_.Exception.Message)" $Red
    exit 1
}