# ResolveX – Customer Complaint Management System

ResolveX is a **MERN-stack Customer Complaint Management System** designed to manage the complete lifecycle of customer complaints — from complaint registration and categorisation to agent assignment, SLA tracking, resolution, and closure.

The project was developed as part of the **Thinqloud Campus Hiring Application Development Assessment – Topic #7: Customer Complaint Management**.

---

## 🚀 Features

### 👤 User & Authentication

* Customer registration and login
* Secure password hashing using `bcryptjs`
* JWT-based authentication
* Role-based access control
* Separate dashboards for Customer, Agent, and Admin

### 📋 Complaint Management

* Create and view complaints
* Complaint category and priority
* Complaint description and details
* Complaint status workflow
* SLA due-date tracking
* Complaint assignment to agents
* Complaint comments
* Complaint activity/history timeline

### 👨‍💼 Admin Features

* View all complaints
* Monitor complaint status
* Assign complaints to agents
* Monitor pending and overdue complaints
* Manage complaint workflow

### 🧑‍💻 Agent Features

* View assigned complaints
* Update complaint status
* Add comments
* Work on complaints within the assigned SLA
* Mark complaints as resolved

### 👥 Customer Features

* Register and log in
* Create complaints
* View submitted complaints
* Track complaint status
* Add comments
* View complaint activity/history

### 🤖 AI Complaint Classification

ResolveX includes an optional AI-assisted complaint classification module.

The AI module can help analyse a complaint and suggest:

* Complaint category
* Complaint priority
* Classification information

The system also includes fallback handling so that complaint management can continue when the AI service is unavailable.

### 📧 Email Notifications

Email notification functionality is included for relevant complaint-related events.

---

# 🛠️ Technology Stack

## Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3

## Backend

* Node.js
* Express.js
* REST APIs
* JWT
* bcryptjs

## Database

* MongoDB Atlas
* Mongoose

## AI

* AI-powered complaint classification
* Configurable AI API integration

## Development Tools

* Git
* GitHub
* VS Code
* Postman
* MongoDB Atlas

---

# 🏗️ System Architecture

```text
                     ┌──────────────────────┐
                     │       Customer       │
                     │ Register / Login     │
                     │ Create Complaint     │
                     └──────────┬───────────┘
                                │
                                ▼
                 ┌───────────────────────────┐
                 │     React + Vite Client   │
                 │                           │
                 │ Dashboards                │
                 │ Complaints                │
                 │ Comments                  │
                 │ Activity Timeline         │
                 └─────────────┬─────────────┘
                               │
                         REST API / HTTP
                               │
                               ▼
                 ┌───────────────────────────┐
                 │    Node.js + Express      │
                 │                           │
                 │ Authentication            │
                 │ Authorization             │
                 │ Complaint APIs             │
                 │ User APIs                  │
                 │ Assignment APIs            │
                 │ Comment APIs               │
                 │ SLA Monitoring             │
                 │ AI Classification          │
                 └─────────────┬─────────────┘
                               │
                           Mongoose
                               │
                               ▼
                 ┌───────────────────────────┐
                 │       MongoDB Atlas       │
                 │                           │
                 │ Users                     │
                 │ Complaints                │
                 │ Comments                  │
                 │ Activity History           │
                 └───────────────────────────┘
```

---

# 🔄 Complaint Workflow

```text
Customer Creates Complaint
          │
          ▼
        OPEN
          │
          ▼
Admin Assigns Agent
          │
          ▼
      ASSIGNED
          │
          ▼
Agent Starts Working
          │
          ▼
    IN_PROGRESS
          │
          ▼
Agent Resolves Complaint
          │
          ▼
      RESOLVED
          │
          ▼
        CLOSED
```

The exact status transitions depend on the application's configured workflow.

---

# 🔐 Authentication & Authorization

ResolveX uses **JWT-based authentication**.

### Authentication Flow

```text
User Login
    │
    ▼
POST /api/auth/login
    │
    ▼
Validate Credentials
    │
    ▼
Compare Password using bcrypt
    │
    ▼
Generate JWT
    │
    ▼
Authenticated Request
    │
    ▼
JWT Verification Middleware
    │
    ▼
Role Authorization
    │
    ▼
Protected Controller
```

### Security Measures

* Passwords are hashed using `bcryptjs`
* JWT is used for authentication
* Protected routes require authentication
* Role-based authorization restricts access
* Sensitive configuration is stored using environment variables
* API credentials are not stored directly in source code

---

# ⏱️ SLA Management

Each complaint can have an associated SLA due date based on its priority/category rules.

The system can use the SLA information to identify:

* Pending complaints
* Complaints approaching their deadline
* Overdue complaints
* Complaint resolution performance

This helps administrators monitor unresolved complaints and ensure timely resolution.

---

# 🤖 AI Complaint Classification

ResolveX provides an optional AI-assisted complaint analysis feature.

### Flow

```text
Customer Complaint
        │
        ▼
AI Analysis API
        │
        ├───────────────┐
        ▼               ▼
   Category          Priority
        │               │
        └───────┬───────┘
                ▼
        Complaint System
```

The AI feature is designed as an enhancement to the normal complaint workflow rather than a required dependency.

If the AI service is unavailable, the application can continue using the standard complaint-management workflow.

For detailed AI setup and implementation information, see:

```text
AI_IMPLEMENTATION.md
```

---

# 📁 Project Structure

```text
ResolveX/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── context/
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── AI_IMPLEMENTATION.md
├── README.md
└── .gitignore
```

> The exact folders may vary slightly depending on the current implementation.

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/Purva211/Resolvex.git
cd Resolvex
```

---

## 2. Configure MongoDB Atlas

Create a MongoDB Atlas cluster and obtain the MongoDB connection string.

Make sure your IP address is allowed in the MongoDB Atlas network access settings.

---

# 🖥️ Backend Setup

Open a terminal:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create the environment file:

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Then update `.env` with your configuration.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
```

Add any additional environment variables required by your current AI/email configuration.

Start the development server:

```bash
npm run dev
```

Backend will run at:

```text
http://localhost:5000
```

---

# 🌐 Frontend Setup

Open another terminal:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

Frontend will run at:

```text
http://localhost:5173
```

---

# 👤 Demo Accounts

The project includes demo accounts for testing.

| Role     | Email                   | Password |
| -------- | ----------------------- | -------- |
| Admin    | `admin@resolvex.com`    | `123456` |
| Agent    | `agent@resolvex.com`    | `123456` |
| Customer | `customer@resolvex.com` | `123456` |

> For production deployment, replace demo credentials with secure credentials and never commit real passwords or secrets to GitHub.

---

# 🧪 Basic Demo Flow

### Step 1 – Customer

Login as:

```text
customer@resolvex.com
```

Create a complaint with:

* Complaint title
* Description
* Category
* Priority

---

### Step 2 – Admin

Login as:

```text
admin@resolvex.com
```

The admin can:

* View the complaint
* Check its priority/SLA
* Assign the complaint to an agent

---

### Step 3 – Agent

Login as:

```text
agent@resolvex.com
```

The agent can:

```text
ASSIGNED
   ↓
IN_PROGRESS
   ↓
RESOLVED
```

The agent can also add comments and update the complaint.

---

### Step 4 – Customer

Login again as the customer.

The customer can:

* View the complaint
* Check its current status
* Read the activity timeline
* Add comments
* Track resolution

---

# 🔌 API Overview

The backend follows a REST API architecture.

Typical API modules include:

```text
/api/auth
/api/users
/api/complaints
/api/comments
/api/admin
/api/agents
/api/ai
```

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### Complaint Operations

```text
POST   /api/complaints
GET    /api/complaints
GET    /api/complaints/:id
PUT    /api/complaints/:id
```

### AI Analysis

```text
POST /api/ai/analyze-complaint
```

> The exact endpoints should be verified against the current route files before using this section as API documentation.

---

# 🗄️ Database Design

The application uses MongoDB Atlas with Mongoose.

The main entities include:

```text
User
 │
 ├── role
 ├── name
 ├── email
 └── password

Complaint
 │
 ├── customer
 ├── assignedAgent
 ├── category
 ├── priority
 ├── status
 ├── description
 ├── slaDueDate
 └── timestamps

Comment
 │
 ├── complaint
 ├── user
 ├── message
 └── timestamp

Activity / History
 │
 ├── complaint
 ├── user
 ├── action
 └── timestamp
```

Relationships are handled using MongoDB ObjectId references through Mongoose.

---

# 🧑‍💻 Development Commands

## Backend

```bash
cd server
npm install
npm run dev
```

If a seed script is configured:

```bash
npm run seed
```

## Frontend

```bash
cd client
npm install
npm run dev
```

---

# 🔒 Environment Variables

Do not commit `.env` files containing secrets.

Example:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Additional variables may be required for:

* AI API
* Email service
* Other third-party integrations

Use `.env.example` as the reference for the required configuration.

---

# 🚀 Deployment

ResolveX can be deployed using services such as:

### Frontend

* Vercel
* Netlify

### Backend

* Render
* Railway
* AWS EC2

### Database

* MongoDB Atlas

For production deployment:

1. Configure production environment variables.
2. Configure MongoDB Atlas network access.
3. Deploy the backend.
4. Update the frontend API base URL.
5. Configure CORS.
6. Build and deploy the React application.
7. Test authentication and protected APIs.

---

# 🛡️ Error Handling & Reliability

The application is designed to handle common application failures such as:

* Invalid login credentials
* Unauthorized API requests
* Invalid complaint operations
* Database errors
* Missing configuration
* AI service/API failures

The AI functionality includes fallback behavior so that the core complaint-management workflow does not depend completely on the AI service.

---

# 📊 Future Enhancements

Potential improvements include:

* File attachments for complaints
* Advanced analytics and reports
* Complaint trend charts
* Advanced filtering and search
* Email/SMS notification improvements
* Customer satisfaction/rating system
* Escalation management
* More detailed SLA analytics
* Production monitoring and logging
* Automated report generation

---

# 🎯 Project Objective

The main objective of ResolveX is to provide a structured platform where organizations can:

```text
Capture Complaints
       ↓
Categorize Complaints
       ↓
Prioritize Complaints
       ↓
Assign Responsibility
       ↓
Track SLA
       ↓
Monitor Progress
       ↓
Resolve Complaints
       ↓
Maintain History
```

This provides a complete digital workflow for managing customer complaints and improving visibility into the resolution process.

---

# 👩‍💻 Author

**Purva Satish Dev**

B.Tech Computer Engineering

GitHub: `Purva211`

---

# 📄 License

This project was developed for educational, assessment, and portfolio purposes.
