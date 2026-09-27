# ResolveX - Customer Complaint Management System

Simple MERN full-stack project for the Thinqloud Campus Hiring Application Development Assessment. The assessment's Topic #7 is Customer Complaint Management: capture complaints, categorise them, assign responsibility, track resolution and monitor pending complaints.

## Features
- Customer registration/login
- Admin/Agent/Customer roles
- Create and view complaints
- Category and priority
- SLA due date
- Admin assignment to agents
- Complaint status workflow
- Comments
- Activity/history timeline
- Role-based dashboards

## Stack
React + Vite, Node.js + Express, MongoDB + Mongoose, JWT, bcryptjs.

## 1. Start MongoDB
Use local MongoDB or MongoDB Atlas.

## 2. Backend
```bash
cd server
npm install
copy .env.example .env   # Windows PowerShell: Copy-Item .env.example .env
# edit .env if needed
npm run seed
npm run dev
```
Backend: http://localhost:5000

## 3. Frontend
Open another terminal:
```bash
cd client
npm install
npm run dev
```
Frontend: http://localhost:5173

## Demo accounts
- Admin: admin@resolvex.com / 123456
- Agent: agent@resolvex.com / 123456
- Customer: customer@resolvex.com / 123456

## Basic demo flow
1. Login as customer and create a complaint.
2. Login as admin and assign it to the agent.
3. Login as agent and change status to IN_PROGRESS and then RESOLVED.
4. Login as customer and add a comment / observe the timeline.

## Next upgrades
- File attachments
- Email notifications
- AI category/priority suggestion
- Charts with Chart.js
- Advanced filters and reports
- Production deployment


## AI Complaint Classification

ResolveX includes an optional AI assistant for complaint classification. See `AI_IMPLEMENTATION.md` for setup, API details, SLA rules, fallback behavior, and testing.
