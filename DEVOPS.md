# E-commerce DevOps Documentation

## 🚀 Overview
This document provides comprehensive DevOps automation for the multi-agent e-commerce project, including build scripts, deployment pipelines, and operational tools.

## 📁 DevOps Structure
```
├── .github/workflows/          # GitHub Actions CI/CD pipelines
├── scripts/                    # PowerShell automation scripts
├── docker-compose.yml          # Container orchestration
├── Dockerfile.backend          # Backend container configuration
├── Dockerfile.frontend         # Frontend container configuration
└── DEVOPS.md                   # This documentation
```

## 🛠️ Available Scripts

### Build & Development Scripts

#### `scripts/build-all.ps1`
**Purpose**: Builds both backend and frontend for production
```powershell
# Full production build
./scripts/build-all.ps1

# Debug build without cleaning
./scripts/build-all.ps1 -Clean $false -Configuration Debug
```

**Features**:
- ✅ Prerequisites validation (.NET, Node.js)
- 🧹 Clean build artifacts
- 📦 Restore dependencies
- 🔨 Build both projects
- 📊 Build summary with artifact sizes

#### `scripts/start-dev.ps1`
**Purpose**: Starts development servers concurrently
```powershell
# Start both backend and frontend
./scripts/start-dev.ps1

# Start only backend
./scripts/start-dev.ps1 -BackendOnly

# Start only frontend
./scripts/start-dev.ps1 -FrontendOnly

# Skip dependency installation for faster startup
./scripts/start-dev.ps1 -SkipInstall
```

**Features**:
- 🔍 Port availability checking
- 🚀 Concurrent server startup
- ⏳ Health check waiting
- 📡 Service URL display

### Health & Monitoring Scripts

#### `scripts/health-check.ps1`
**Purpose**: Comprehensive system health validation
```powershell
# Basic health check
./scripts/health-check.ps1

# Detailed information
./scripts/health-check.ps1 -Detailed

# Auto-fix common issues
./scripts/health-check.ps1 -FixIssues
```

**Checks Include**:
- ✅ Prerequisites (.NET, Node.js, Git)
- 🏗️ Project structure integrity
- 🚀 Service health (API/Frontend running)
- 📦 Build artifacts status
- 🌐 Network connectivity
- 📊 Overall health score

### Maintenance Scripts

#### `scripts/reset-environment.ps1`
**Purpose**: Clean reset of development environment
```powershell
# Quick reset (keep dependencies)
./scripts/reset-environment.ps1

# Full reset with reinstall
./scripts/reset-environment.ps1 -Full

# Dry run to see what would be cleaned
./scripts/reset-environment.ps1 -DryRun

# Keep dependencies, reset git state
./scripts/reset-environment.ps1 -GitReset -KeepDependencies
```

**Features**:
- 🛑 Stop running development servers
- 🧹 Clean build artifacts and temp files
- 🗑️ Remove dependencies (optional)
- 🔄 Git state reset (optional)
- 📦 Automatic dependency reinstall

## 🐳 Container Deployment

### Docker Configuration

#### Backend Container (`Dockerfile.backend`)
- **Base**: .NET 9.0 Runtime (Alpine)
- **Build**: Multi-stage with SDK
- **Security**: Non-root user
- **Health Check**: Swagger endpoint monitoring
- **Port**: 5217

#### Frontend Container (`Dockerfile.frontend`)
- **Base**: Node.js 18 (Build) + Nginx (Production)
- **Features**: Gzip compression, security headers
- **Routing**: SPA routing support
- **API Proxy**: Backend integration
- **Port**: 80

### Docker Compose Services

```bash
# Start core services (backend + frontend)
docker-compose up -d

# Start with proxy
docker-compose --profile proxy up -d

# Start with database
docker-compose --profile database up -d

# Start everything
docker-compose --profile proxy --profile database --profile cache up -d

# Scale frontend
docker-compose up -d --scale frontend=3
```

**Available Services**:
- 🚀 **backend**: .NET API (port 5217)
- 🌐 **frontend**: React app (port 3000)
- 🔀 **proxy**: Traefik reverse proxy (port 80/443/8080)
- 💾 **database**: PostgreSQL (port 5432) - *Profile: database*
- ⚡ **cache**: Redis (port 6379) - *Profile: cache*

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow (`.github/workflows/ci-cd.yml`)

#### Pipeline Stages:
1. **🚀 Backend Build & Test**
   - .NET SDK setup
   - Dependency restoration
   - Build and test execution
   - Artifact upload

2. **🌐 Frontend Build & Test**
   - Node.js setup with caching
   - Dependency installation
   - Test execution with coverage
   - Production build

3. **🔒 Security & Quality Analysis**
   - Vulnerability scanning
   - Package audit
   - Security report generation

4. **🧪 Integration Tests**
   - Service health validation
   - API endpoint testing
   - Cross-service communication

5. **🚀 Deployment Stages**
   - **Staging**: Automatic on main branch
   - **Production**: Manual approval required

6. **📢 Notifications**
   - Build status reporting
   - Pipeline summary

#### Trigger Conditions:
- **Push**: All development branches
- **Pull Request**: main, develop branches
- **Manual**: Workflow dispatch available

## 🔧 Environment Configuration

### Development Environment
```bash
# Backend API
URL: http://localhost:5217
Swagger: http://localhost:5217/swagger

# Frontend App
URL: http://localhost:3000
API Proxy: Configured to backend

# Database (Optional)
PostgreSQL: localhost:5432
Redis: localhost:6379
```

### Production Environment
```bash
# With Proxy
Frontend: http://ecommerce.local
Backend API: http://api.ecommerce.local
Admin Dashboard: http://proxy.ecommerce.local:8080

# Direct Access
Frontend: http://localhost:3000
Backend: http://localhost:5217
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints
- **Backend**: `GET /swagger` (200 OK)
- **Frontend**: `GET /` (200 OK)
- **Database**: `pg_isready` command
- **Cache**: `redis-cli ping` command

### Monitoring Features
- 📈 Service uptime tracking
- 🔍 Dependency health validation
- 📊 Build artifact monitoring
- 🌐 Network connectivity checks
- ⚠️ Automated issue detection

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Build Failures
```bash
# Check prerequisites
./scripts/health-check.ps1 -Detailed

# Clean rebuild
./scripts/reset-environment.ps1 -Full
./scripts/build-all.ps1
```

#### Port Conflicts
```bash
# Check what's using ports
netstat -ano | findstr :5217
netstat -ano | findstr :3000

# Kill conflicting processes
taskkill /PID <process-id> /F
```

#### Development Server Issues
```bash
# Reset and restart
./scripts/reset-environment.ps1
./scripts/start-dev.ps1

# Check health status
./scripts/health-check.ps1 -FixIssues
```

#### Container Issues
```bash
# View logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Restart services
docker-compose restart
docker-compose down && docker-compose up -d
```

## 🔐 Security Considerations

### Build Security
- 🔒 Non-root container users
- 🛡️ Minimal base images
- 🔍 Vulnerability scanning in CI/CD
- 📦 Package audit automation

### Runtime Security
- 🌐 HTTPS termination at proxy
- 🔐 Security headers (XSS, CSRF protection)
- 🚫 Hidden file access prevention
- 🔒 Process isolation

### Development Security
- 🗝️ No secrets in code/containers
- 🔐 Environment variable configuration
- 🛡️ Secure default configurations
- 📋 Security scan reporting

## 📈 Performance Optimization

### Build Optimization
- 📦 Docker layer caching
- 🗜️ Multi-stage builds
- ⚡ Dependency caching
- 🔄 Parallel build stages

### Runtime Optimization
- 🗜️ Gzip compression
- 📁 Static asset caching
- ⚡ Connection pooling
- 📊 Resource monitoring

## 🚀 Deployment Strategies

### Local Development
1. `./scripts/start-dev.ps1` - Quick development startup
2. `docker-compose up -d` - Containerized development

### Staging Deployment
1. Automatic on main branch push
2. Full pipeline validation
3. Integration testing
4. Smoke test execution

### Production Deployment
1. Manual approval gate
2. Blue-green deployment ready
3. Rollback capability
4. Post-deployment monitoring

## 📝 Maintenance Tasks

### Daily
- ✅ Health check execution
- 📊 Build status monitoring
- 🔍 Log review

### Weekly  
- 🔄 Dependency updates
- 🧹 Artifact cleanup
- 📈 Performance review

### Monthly
- 🔒 Security audit
- 📦 Container image updates
- 🔄 Backup verification

## 🤝 Multi-Agent Integration

### Communication with Other Agents
- **Backend Agent**: Build pipeline integration, API health monitoring
- **Frontend Agent**: Asset optimization, deployment coordination  
- **Testing Agent**: E2E test execution, quality gates
- **All Agents**: Centralized build artifacts, deployment status

### Shared Resources
- 📁 `shared-comms.md` - Agent communication
- 🔧 Build artifacts and reports
- 🚀 Deployment status updates
- 📊 Health and monitoring data

---

**📞 Need Help?**
- Check the health status: `./scripts/health-check.ps1`
- Reset environment: `./scripts/reset-environment.ps1 -DryRun`
- View container logs: `docker-compose logs -f`
- Contact DevOps team through `shared-comms.md`