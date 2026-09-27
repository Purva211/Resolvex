# ResolveX – Customer Complaint Management System

ResolveX is a **MERN-stack Customer Complaint Management System** developed for the **Thinqloud Campus Hiring Application Development Assessment – Topic #7: Customer Complaint Management**.

The system manages the complete complaint lifecycle, from complaint creation and categorisation to assignment, SLA tracking, resolution, and closure.

## Features

* Customer registration and login
* JWT-based authentication
* Role-based access control
* Customer, Admin, and Agent roles
* Create and manage complaints
* Complaint category and priority
* SLA due-date tracking
* Admin assignment to agents
* Complaint status workflow
* Comments and activity/history timeline
* Role-based dashboards
* Email notifications
* AI-assisted complaint category and priority classification
* AI fallback handling when the AI service is unavailable

## Tech Stack

* **Frontend:** React.js, Vite
* **Backend:** Node.js, Express.js
* **Database:** MongoDB Atlas, Mongoose
* **Authentication:** JWT, bcryptjs
* **AI:** AI-based complaint classification

## Complaint Workflow

```text
Customer
   ↓
Create Complaint
   ↓
OPEN
   ↓
Admin Assigns Agent
   ↓
ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
   ↓
CLOSED
```

## Project Structure

```text
ResolveX/
├── client/              # React + Vite frontend
├── server/              # Node.js + Express backend
├── AI_IMPLEMENTATION.md # AI implementation details
└── README.md
```

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/Purva211/Resolvex.git
cd Resolvex
```

### 2. Backend

```bash
cd server
npm install
```

Create `.env` from `.env.example` and configure MongoDB Atlas and other required environment variables.

```bash
npm run seed
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Frontend

Open another terminal:

```bash
cd client
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Demo Accounts

| Role     | Email                                                 | Password |
| -------- | ----------------------------------------------------- | -------- |
| Admin    | [admin@resolvex.com](mailto:admin@resolvex.com)       | 123456   |
| Agent    | [agent@resolvex.com](mailto:agent@resolvex.com)       | 123456   |
| Customer | [customer@resolvex.com](mailto:customer@resolvex.com) | 123456   |

## Basic Demo Flow

1. Login as **Customer** and create a complaint.
2. Login as **Admin** and assign the complaint to an agent.
3. Login as **Agent** and update the complaint status.
4. Resolve the complaint and add comments.
5. Login as **Customer** to track the complaint and view its activity timeline.

## AI Complaint Classification

ResolveX includes an optional AI assistant for analysing complaints and suggesting:

* Category
* Priority

The AI implementation, API configuration, SLA rules, fallback behaviour, and testing details are documented in `AI_IMPLEMENTATION.md`.

## Project

<img width="1464" height="855" alt="Screenshot 2026-09-27 222300" src="https://github.com/user-attachments/assets/3b87f197-3ccb-4aee-a1e0-fc2d4fc216d5" />

<img width="1919" height="988" alt="Screenshot 2026-09-27 222928" src="https://github.com/user-attachments/assets/42009483-64db-4d03-9ad0-5c755aecdce1" />

<img width="952" height="980" alt="Screenshot 2026-09-27 223009" src="https://github.com/user-attachments/assets/a746105c-c4fc-490f-b84d-91815536c273" />

<img width="1913" height="1000" alt="Screenshot 2026-09-27 235715" src="https://github.com/user-attachments/assets/5c75669c-b89a-4f56-bb24-b891941cb773" />

<img width="1919" height="1000" alt="Screenshot 2026-09-27 235809" src="https://github.com/user-attachments/assets/1d407cf5-ca53-46d9-83ca-6ae5fd08303a" />

<img width="1918" height="987" alt="Screenshot 2026-09-27 235824" src="https://github.com/user-attachments/assets/a040fee6-bfd4-43dd-b635-8c13d66cf725" />

<img width="1919" height="990" alt="Screenshot 2026-09-28 000013" src="https://github.com/user-attachments/assets/46f9d0f2-e53a-4a0f-bf20-e48b0c0e71fd" />

<img width="1919" height="996" alt="Screenshot 2026-09-28 000031" src="https://github.com/user-attachments/assets/ee2f67c6-568e-47c2-9c73-225b7049ec69" />

## Author

**Purva Satish Dev**

GitHub: **Purva211**
