# Root CLAUDE.md - Multi-Agent E-commerce Project

## Project Structure & Multi-Agent Setup
This project uses **git worktrees** to enable multiple AI agents to work simultaneously:

```
Desktop/ecommerce-demo/              # Main project (main branch)
Desktop/ecommerce-frontend-dev/      # Frontend Agent workspace (frontend-dev branch)
Desktop/ecommerce-backend-dev/       # Backend Agent workspace (backend-dev branch)  
Desktop/ecommerce-testing-dev/       # Testing Agent workspace (testing-dev branch)
Desktop/ecommerce-devops-dev/        # DevOps Agent workspace (devops-dev branch)
```

## Agent Roles & Responsibilities
- **Backend Agent**: API endpoints, data models, business logic, database setup
- **Frontend Agent**: React components, UI/UX, API integration, routing
- **Testing Agent**: Unit tests, integration tests, test automation
- **DevOps Agent**: Build scripts, CI/CD, deployment, infrastructure

## Multi-Agent Collaboration Commands

### Getting Updates from Other Agents
```bash
# See what other agents have done
git fetch origin
git log --oneline origin/backend-dev    # Check backend agent's work
git log --oneline origin/frontend-dev   # Check frontend agent's work

# Pull changes from another agent's branch
git merge origin/backend-dev             # Integrate backend changes
git merge origin/testing-dev             # Integrate testing changes
```

### Sharing Your Work with Other Agents
```bash
# Commit your changes
git add .
git commit -m "Descriptive commit message"

# Push to make available to other agents
git push origin [your-branch-name]

# Notify other agents (see communication section below)
```

## Agent Communication System

### Method 1: Shared Communication File
**IMPORTANT**: Use `shared-comms.md` for agent-to-agent communication

**To request help from another agent:**
```markdown
## [TIMESTAMP] Request from [YOUR-AGENT-NAME] to [TARGET-AGENT]
**Status**: PENDING
**Request**: Brief description
**Details**: Detailed requirements
**Branch**: Your current branch name
**Files**: Relevant file paths
```

**To respond to a request:**
```markdown
**Status**: COMPLETED
**Response**: What you implemented
**Branch**: Branch with changes
**Commit**: Commit hash
**Next Steps**: What the requesting agent should do
```

### Method 2: GitHub Issues for Complex Requests
```bash
# Create issue for another agent
gh issue create --title "Backend: Need checkout API endpoint" --body "Frontend needs POST /api/checkout endpoint with cart validation"

# Assign to project for tracking
gh issue create --title "Testing: Need integration tests for cart" --assignee @me
```

## Technology Stack
- **Backend**: .NET 8, Entity Framework Core (In-Memory DB), Swagger
- **Frontend**: React 18, Axios, React Router, CSS Modules
- **Testing**: xUnit (.NET), Jest (React), Playwright (E2E)
- **Tools**: VS Code, Git worktrees, GitHub CLI

## Development Workflow
1. **Check for updates**: `git fetch origin` before starting work
2. **Review communications**: Check `shared-comms.md` for requests
3. **Work on your tasks**: Implement features in your domain
4. **Share progress**: Commit and push regularly
5. **Communicate needs**: Update `shared-comms.md` when you need help
6. **Integrate when ready**: Pull changes from other agents as needed

## Code Quality Standards
- Write descriptive commit messages using conventional commits
- Include comments for complex logic
- Follow language-specific style guides (.NET conventions, React hooks patterns)
- Write tests for new features
- Update documentation when adding new APIs or components

---

# Backend Agent CLAUDE.md

## Your Role: Backend Development Lead
You are responsible for the .NET 8 Web API backend. Your workspace is `ecommerce-backend-dev/` on the `backend-dev` branch.

## Multi-Agent Collaboration

### Monitoring Frontend Needs
**Before starting work, always check:**
1. `shared-comms.md` for requests from Frontend Agent
2. `git log origin/frontend-dev` to see what frontend is building
3. GitHub issues tagged "backend"

### Common Frontend Requests You'll Receive:
- New API endpoints (products, cart, checkout, orders)
- Data model changes (add fields, validation rules)
- Authentication/authorization features
- Error handling and status codes

### How to Respond to Requests:
1. Update `shared-comms.md` with "IN PROGRESS" status
2. Implement the requested feature
3. Test with Swagger UI
4. Commit with descriptive message
5. Update `shared-comms.md` with "COMPLETED" and usage details
6. Push changes: `git push origin backend-dev`

## Your Current Tasks
1. **Product Management API**
   - GET /api/products (list with filtering)
   - GET /api/products/{id}
   - POST /api/products (admin)
   - PUT /api/products/{id}
   - DELETE /api/products/{id}

2. **Shopping Cart API**
   - GET /api/cart/{userId}
   - POST /api/cart/add
   - PUT /api/cart/update
   - DELETE /api/cart/remove/{itemId}

3. **Order Processing API**
   - POST /api/orders (checkout)
   - GET /api/orders/{userId}

## Integration Commands
```bash
# See what frontend agent needs
cat ../ecommerce-frontend-dev/shared-comms.md

# Get frontend changes if needed
git merge origin/frontend-dev

# Test your API endpoints
dotnet run
# Open https://localhost:5001/swagger
```

## Development Commands
- `dotnet run` - Start development server
- `dotnet build` - Build project
- `dotnet test` - Run tests
- `dotnet ef database update` - Update database

---

# Frontend Agent CLAUDE.md

## Your Role: Frontend Development Lead
You are responsible for the React frontend. Your workspace is `ecommerce-frontend-dev/` on the `frontend-dev` branch.

## Multi-Agent Collaboration

### Requesting Backend Support
**When you need API endpoints:**
1. Add request to `shared-comms.md`:
```markdown
## [TIMESTAMP] Request from Frontend Agent to Backend Agent
**Status**: PENDING
**Request**: Need checkout API endpoint
**Details**: 
- POST /api/checkout
- Accept: { userId, cartItems[], shippingAddress, paymentMethod }
- Return: { orderId, status, total, estimatedDelivery }
- Validation: Check inventory, calculate totals, validate payment
**Branch**: frontend-dev
**Files**: src/components/Checkout.jsx
```

2. Continue with other features while waiting
3. Check `shared-comms.md` regularly for Backend Agent responses
4. When backend completes: `git merge origin/backend-dev`

### Monitoring Backend Changes
```bash
# Check what APIs are available
git fetch origin
git log --oneline origin/backend-dev

# Get latest backend changes
git merge origin/backend-dev

# Check API documentation
cd ../ecommerce-backend-dev
dotnet run
# Visit https://localhost:5001/swagger
```

## Your Current Tasks
1. **Product Listing Page**
   - Product grid with search/filter
   - Responsive design
   - Loading states

2. **Shopping Cart Component**
   - Add/remove items
   - Quantity updates
   - Persist cart state

3. **Checkout Flow**
   - Cart review
   - Shipping information
   - Order confirmation

## Integration Commands
```bash
# Request backend help
echo "## [$(date)] Request from Frontend to Backend" >> shared-comms.md

# Check for backend responses
cat shared-comms.md | grep -A 10 "Frontend Agent"

# Get backend updates
git merge origin/backend-dev

# Start development server
npm start
```

## Component Guidelines
- Use functional components with hooks
- Keep components under 200 lines
- Separate API calls into custom hooks
- Use CSS modules for styling
- Include proper error handling and loading states

---

# Testing Agent CLAUDE.md

## Your Role: Quality Assurance Lead
You ensure code quality across all components. Your workspace is `ecommerce-testing-dev/` on the `testing-dev` branch.

## Multi-Agent Collaboration

### Monitoring All Agents
**Your job is to test everyone's work:**
```bash
# Check all agent progress
git fetch origin
git log --oneline origin/backend-dev origin/frontend-dev

# Pull all changes for testing
git merge origin/backend-dev
git merge origin/frontend-dev
```

### Testing Requests You'll Make
**To Backend Agent:**
```markdown
## Request from Testing Agent to Backend Agent
**Request**: Need test data seeding endpoint
**Details**: POST /api/seed-test-data for consistent test scenarios
```

**To Frontend Agent:**
```markdown
## Request from Testing Agent to Frontend Agent  
**Request**: Add test IDs to components
**Details**: Add data-testid attributes for E2E testing
```

## Your Testing Strategy
1. **Backend Tests** (in ecommerce-backend-dev after merging)
   - Unit tests for services and controllers
   - Integration tests for API endpoints
   - Test data setup and teardown

2. **Frontend Tests** (in ecommerce-frontend-dev after merging)
   - Component unit tests with Jest/React Testing Library
   - Integration tests for user flows
   - Mock API responses

3. **End-to-End Tests** (in your testing workspace)
   - Full user journey tests
   - Cross-browser compatibility
   - Performance testing

## Testing Commands
```bash
# Backend tests
cd ../ecommerce-backend-dev && dotnet test

# Frontend tests  
cd ../ecommerce-frontend-dev && npm test

# E2E tests (your workspace)
npx playwright test
```

---

# Shared Communication Template (shared-comms.md)

# Multi-Agent Communication Log

## Active Requests

### [2024-01-XX 14:30] Frontend Agent → Backend Agent
**Status**: PENDING
**Request**: Checkout API endpoint
**Details**: 
- Endpoint: POST /api/checkout
- Input: { userId, cartItems[], shippingInfo, paymentMethod }
- Output: { orderId, status, total, confirmationNumber }
- Validation: Inventory check, payment processing simulation
**Branch**: frontend-dev
**Files**: src/components/Checkout.jsx
**Priority**: HIGH - Blocking checkout feature

---

### [2024-01-XX 15:15] Testing Agent → All Agents
**Status**: PENDING  
**Request**: Add test identifiers
**Details**: Please add data-testid attributes to major UI components and API test endpoints
**Affects**: All components and controllers
**Priority**: MEDIUM - Needed for E2E testing

---

## Completed Requests

### [2024-01-XX 13:45] Frontend Agent → Backend Agent ✅
**Status**: COMPLETED
**Request**: Product listing API
**Response**: Implemented GET /api/products with filtering
**Branch**: backend-dev
**Commit**: abc123 - "Add product listing with search and category filters"
**Usage**: 
```javascript
// GET /api/products?search=laptop&category=electronics&limit=10
const response = await fetch('/api/products?search=laptop');
```
**Next Steps**: Frontend can integrate with the new endpoint

---

## Communication Guidelines

### Request Format:
```markdown
### [TIMESTAMP] [FROM-AGENT] → [TO-AGENT]
**Status**: PENDING/IN_PROGRESS/COMPLETED
**Request**: Brief title
**Details**: Specific requirements
**Branch**: Your branch name
**Files**: Relevant files
**Priority**: HIGH/MEDIUM/LOW
```

### Response Format:
```markdown
**Status**: COMPLETED
**Response**: What was implemented
**Branch**: Branch with changes  
**Commit**: Commit hash
**Usage**: Code examples or API documentation
**Next Steps**: What the requesting agent should do
```

### Status Updates:
- Update status to "IN_PROGRESS" when you start working
- Update to "COMPLETED" when finished
- Add implementation details and usage instructions
- Move completed requests to "Completed Requests" section
