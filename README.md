# ProjectHub — Project Management App

A full-stack web application where users can create projects, assign tasks, and track progress with role-based access control (Admin/Member).

## Live Demo
[https://project-hub-2-production.up.railway.app/]

## Features
- Authentication (Signup/Login with JWT)
- Project & team management (create projects, add/remove members)
- Task creation, assignment & status tracking (Todo / In Progress / Done)
- Dashboard with stats (total tasks, completed, overdue)
- Role-based access control (Admin / Member)

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT + bcryptjs
- **Deployment:** Railway

## Getting Started

### Backend Setup
cd backend && npm install
Create .env with PORT, MONGO_URI, JWT_SECRET
npm run dev

### Frontend Setup
cd frontend && npm install
npm run dev
Visit http://localhost:5174

## API Endpoints

### Auth
POST /api/auth/register
POST /api/auth/login

### Projects
GET    /api/projects
POST   /api/projects
PUT    /api/projects/:id/members
DELETE /api/projects/:id/members
DELETE /api/projects/:id

### Tasks
GET    /api/tasks/:projectId
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id

## Roles
- Admin: create projects, add/remove members, create/assign/delete tasks
- Member: view assigned projects, update status of their own tasks

## Deployment
Deployed on Railway with separate frontend and backend services.
