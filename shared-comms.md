# Multi-Agent Communication Log

*This file enables AI agents to communicate and coordinate work across different git worktrees*

## 🚨 Active Requests

*Agents: Check this section before starting work to see if other agents need your help*

---

## ✅ Completed Requests

*Completed items are moved here for reference*

---

## 📋 Agent Status Board

| Agent | Current Task | Status | Last Update | Branch |
|-------|-------------|---------|-------------|---------|
| Backend | Setting up project structure | 🟡 In Progress | 2024-01-XX 14:00 | backend-dev |
| Frontend | Waiting for product API | 🔴 Blocked | 2024-01-XX 14:00 | frontend-dev |
| Testing | Planning test strategy | 🟢 Ready | 2024-01-XX 14:00 | testing-dev |
| DevOps | CI/CD setup | 🟡 In Progress | 2024-01-XX 14:00 | devops-dev |

---

## 📖 Communication Guidelines

### Making a Request:
1. Add request to "Active Requests" section
2. Use the template below
3. Commit and push this file so other agents can see it
4. Continue with other work while waiting

### Responding to a Request:
1. Update status to "IN_PROGRESS" 
2. Complete the work
3. Update status to "COMPLETED" with details
4. Move to "Completed Requests" section
5. Commit and push your changes

### Request Template:
```markdown
### [TIMESTAMP] REQUEST: [Brief Title]
**From**: [Your Agent Role] (branch: [your-branch])
**To**: [Target Agent Role]
**Status**: PENDING
**Priority**: HIGH/MEDIUM/LOW

**What I need**:
- Specific requirement description

**Details**:
- Technical specifications
- Expected input/output
- Any constraints or preferences

**Why I need it**:
- What feature this enables
- Impact on user experience

**Files involved**:
- List relevant file paths

**I can provide**:
- What you can offer in return
- Related work you've completed
```

### Response Template:
```markdown
**Status**: COMPLETED ✅
**Implemented**: 
- What was built/changed
- Technical approach used

**Location**: 
- Branch: [branch-name]
- Commit: [commit-hash]
- Key files: [file paths]

**How to use**:
```code
// Usage examples
```

**Notes**:
- Any important details
- Known limitations
- Future improvements needed
```

---

## 🔄 Integration Workflow

### For Requesting Agent:
```bash
# 1. Add request to this file
echo "New request added" >> shared-comms.md
git commit -am "Request: Need checkout API from backend"
git push origin [your-branch]

# 2. Continue other work while waiting

# 3. Check for responses regularly
git fetch origin
git show origin/[other-agent-branch]:shared-comms.md

# 4. When completed, integrate the changes
git merge origin/[other-agent-branch]
```

### For Responding Agent:
```bash
# 1. Check for requests
git fetch origin
cat shared-comms.md | grep -A 10 "PENDING"

# 2. Update status and work on request
# Edit shared-comms.md to mark "IN_PROGRESS"
git commit -am "Working on checkout API request"

# 3. Complete the work and update status
# Edit shared-comms.md to mark "COMPLETED" with details
git commit -am "Completed: Checkout API endpoint"
git push origin [your-branch]
```

---

## 🎯 Example Requests

### Example 1: Frontend → Backend
```markdown
### [2024-01-15 14:30] REQUEST: Product Search API
**From**: Frontend Agent (branch: frontend-dev)
**To**: Backend Agent
**Status**: PENDING
**Priority**: HIGH

**What I need**:
- GET endpoint for product search with filters

**Details**:
- Endpoint: GET /api/products/search
- Query params: ?q=searchTerm&category=electronics&minPrice=100&maxPrice=500
- Response: Array of products with id, name, price, description, imageUrl
- Support pagination with limit/offset

**Why I need it**:
- Building product listing page with search functionality
- Core feature for user product discovery

**Files involved**:
- src/components/ProductList.jsx
- src/hooks/useProducts.js

**I can provide**:
- Frontend search UI mockups
- Detailed API response format requirements
```

### Example 2: Testing → Frontend
```markdown
### [2024-01-15 15:45] REQUEST: Test IDs for E2E Testing
**From**: Testing Agent (branch: testing-dev)
**To**: Frontend Agent
**Status**: PENDING
**Priority**: MEDIUM

**What I need**:
- Add data-testid attributes to key UI elements

**Details**:
- Product cards: data-testid="product-card-{id}"
- Add to cart buttons: data-testid="add-to-cart-{productId}"
- Cart items: data-testid="cart-item-{id}"
- Checkout button: data-testid="checkout-button"

**Why I need it**:
- Setting up automated E2E testing with Playwright
- Need reliable selectors that won't break with CSS changes

**Files involved**:
- All React components in src/components/

**I can provide**:
- Complete E2E test coverage
- Automated testing pipeline
- Bug reports and regression testing
```

---

## 🔧 Quick Commands

```bash
# Add a new request quickly
echo "### [$(date '+%Y-%m-%d %H:%M')] REQUEST: Your title here" >> shared-comms.md

# Check for new requests
git fetch origin && git diff HEAD origin/main -- shared-comms.md

# See all agent branches
git branch -a

# Check what each agent has been working on
git log --oneline origin/backend-dev --since="1 day ago"
git log --oneline origin/frontend-dev --since="1 day ago"
git log --oneline origin/testing-dev --since="1 day ago"
```
