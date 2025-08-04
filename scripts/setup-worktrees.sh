#!/bin/bash

# Create worktrees for parallel development
git worktree add ../ecommerce-frontend-dev frontend-dev
git worktree add ../ecommerce-backend-dev backend-dev
git worktree add ../ecommerce-testing-dev testing-dev
git worktree add ../ecommerce-devops-dev devops-dev

echo "Worktrees created successfully!"
echo "Frontend: ../ecommerce-frontend-dev"
echo "Backend: ../ecommerce-backend-dev" 
echo "Testing: ../ecommerce-testing-dev"
echo "DevOps: ../ecommerce-devops-dev"
