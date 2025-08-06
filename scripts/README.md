# DevOps Scripts Usage Guide

## 🚀 Quick Start

All scripts should be run from the **project root directory** (where this README is located).

### Development Workflow

```powershell
# 1. Check system health
./scripts/health-check.ps1

# 2. Start development servers
./scripts/start-dev.ps1

# 3. Run tests (optional)
./scripts/run-tests.ps1

# 4. Build for production
./scripts/build-all.ps1
```

### Clean Environment

```powershell
# Full environment reset
./scripts/reset-environment.ps1 -Full

# Quick reset (keep dependencies)
./scripts/reset-environment.ps1
```

## 📋 Script Reference

### 🔧 `start-dev.ps1`
**Purpose**: Start development servers

```powershell
# Start both backend and frontend
./scripts/start-dev.ps1

# Start only backend
./scripts/start-dev.ps1 -BackendOnly

# Start only frontend  
./scripts/start-dev.ps1 -FrontendOnly

# Skip npm install check
./scripts/start-dev.ps1 -SkipInstall
```

**What it does**:
- ✅ Validates project structure
- 🔍 Checks port availability
- 🚀 Starts backend (.NET) on port 5217
- 🌐 Starts frontend (React) on port 3000
- ⏳ Waits for services to be ready
- 🖥️ Opens separate console windows

### 🔨 `build-all.ps1`
**Purpose**: Build production artifacts

```powershell
# Production build
./scripts/build-all.ps1

# Debug build without cleaning
./scripts/build-all.ps1 -Configuration Debug -Clean $false
```

**What it does**:
- ✅ Validates prerequisites (.NET, Node.js)
- 🧹 Cleans build artifacts (optional)
- 📦 Restores dependencies
- 🔨 Builds backend and frontend
- 📊 Shows build summary

### 🏥 `health-check.ps1`
**Purpose**: System health validation

```powershell
# Basic health check
./scripts/health-check.ps1

# Detailed information
./scripts/health-check.ps1 -Detailed

# Auto-fix issues
./scripts/health-check.ps1 -FixIssues
```

**What it checks**:
- ✅ Prerequisites (.NET, Node.js, Git)
- 🏗️ Project structure
- 🚀 Service health (if running)
- 📦 Build artifacts
- 🌐 Network connectivity

### 🧪 `run-tests.ps1`
**Purpose**: Run application tests

```powershell
# All tests
./scripts/run-tests.ps1

# Frontend tests only
./scripts/run-tests.ps1 -TestType frontend

# Backend tests with coverage
./scripts/run-tests.ps1 -TestType backend -Coverage $true

# Integration tests
./scripts/run-tests.ps1 -TestType integration
```

### 🔄 `reset-environment.ps1`  
**Purpose**: Clean environment reset

```powershell
# Full reset
./scripts/reset-environment.ps1 -Full

# Keep dependencies
./scripts/reset-environment.ps1 -KeepDependencies  

# Dry run (see what would be deleted)
./scripts/reset-environment.ps1 -DryRun

# Git reset
./scripts/reset-environment.ps1 -GitReset
```

## 🚨 Troubleshooting

### Common Issues

**"Project not found" errors**
```powershell
# Check you're in the right directory
Get-Location

# Should show: .../ecommerce-devops-dev
# Should contain: EcommerceApi/ and ecommerce-frontend/
```

**Permission errors**
```powershell
# Enable script execution (Windows)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Port conflicts**
```powershell
# Check what's using ports
netstat -ano | findstr :5217  # Backend
netstat -ano | findstr :3000  # Frontend

# Kill processes if needed
taskkill /PID <process-id> /F
```

**Services not starting**
```powershell
# Check prerequisites
./scripts/health-check.ps1 -Detailed

# Reset and try again  
./scripts/reset-environment.ps1
./scripts/start-dev.ps1
```

### Log Files

When running on Linux/Mac, check these log files:
- `backend.log` - Backend server output
- `frontend.log` - Frontend server output

### Getting Help

1. Run health check: `./scripts/health-check.ps1 -Detailed`
2. Check service status in new console windows
3. Review error messages in the script output
4. Verify you're in the project root directory

## 💡 Tips

- Always run scripts from project root directory
- Use `-DryRun` flags to preview changes
- Check health status regularly during development  
- Scripts create separate console windows for services
- Use Ctrl+C in service windows to stop servers