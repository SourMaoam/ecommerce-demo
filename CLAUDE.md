# E-commerce Demo Project

## Project Structure
- `/EcommerceApi` - .NET 8 Web API backend
- `/ecommerce-frontend` - React frontend application
- `/docs` - Documentation and design assets
- `/scripts` - Build and deployment scripts

## Technology Stack
- Backend: .NET 8, Entity Framework Core (In-Memory DB for demo)
- Frontend: React 18, Axios for API calls, React Router
- Development: VS Code, Git worktrees for parallel development

## Development Commands
- Backend: `dotnet run` (from EcommerceApi folder)
- Frontend: `npm start` (from ecommerce-frontend folder)
- Backend build: `dotnet build`
- Frontend build: `npm run build`

## Code Style Guidelines
- Backend: Follow C# conventions, use async/await, proper error handling
- Frontend: Use functional components with hooks, ES6+ syntax
- Use meaningful variable names and add comments for complex logic
- Write tests for all new features

## Git Workflow
- Use feature branches
- Write descriptive commit messages
- Create PRs for code review
- Use conventional commit format: type(scope): description

## API Design
- RESTful endpoints
- Proper HTTP status codes
- JSON responses
- Include Swagger documentation
