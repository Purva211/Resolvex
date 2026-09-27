# ResolveX — AI Complaint Classification Implementation

## Project inspection

### Technology stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose
- Authentication: JWT + role-based middleware
- HTTP client: Axios
- Existing SLA utility: `server/utils/sla.js`

### Existing complaint workflow found
Customer → New Complaint → Categorization/Priority → Assignment → Agent Status Updates → Resolved → Customer Review → Closed/Reopened.

### Existing files inspected
- `server/models/Complaint.js`
- `server/controllers/complaintController.js`
- `server/routes/complaints.js`
- `server/utils/sla.js`
- `server/server.js`
- `client/src/pages/NewComplaint.jsx`
- `client/src/pages/ComplaintDetails.jsx`
- `client/src/pages/Dashboard.jsx`
- `client/src/services/api.js`
- `client/src/components/ComplaintTable.jsx`

### AI feature added
The system now supports optional AI classification:
- Category
- Priority
- Department
- Explanation

The AI recommendation is reviewed by the user before saving.

### New backend files
- `server/services/aiComplaintService.js`
- `server/controllers/aiController.js`
- `server/routes/ai.js`

### Modified backend files
- `server/models/Complaint.js`
- `server/controllers/complaintController.js`
- `server/utils/sla.js`
- `server/routes/complaints.js`
- `server/server.js`
- `server/package.json`
- `server/.env.example`

### Modified frontend files
- `client/src/pages/NewComplaint.jsx`
- `client/src/pages/ComplaintDetails.jsx`
- `client/src/pages/Dashboard.jsx`
- `client/src/styles.css`

## AI architecture

React → Express → AI service → LLM API → JSON recommendation → human review → final complaint.

The API key is backend-only.

## AI endpoint

`POST /api/ai/analyze-complaint`

Request:
```json
{"description":"Money was deducted from my account but my order was cancelled."}
```

Example response:
```json
{
  "success": true,
  "analysis": {
    "category": "Payment",
    "priority": "HIGH",
    "department": "Finance",
    "slaHours": 24,
    "reason": "The complaint involves a payment deduction despite order cancellation."
  }
}
```

## SLA rules

- LOW: 72 hours
- MEDIUM: 48 hours
- HIGH: 24 hours
- CRITICAL: 8 hours

The backend recalculates SLA from the final priority. It does not blindly trust the AI SLA value.

## Fallback

If the AI key is missing, provider fails, the request times out, or the response is invalid, the frontend displays an AI-unavailable message and manual category/priority/department fields remain usable.

## Environment

Copy `server/.env.example` to `server/.env`.

Set:
- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLIENT_URL`
- `AI_API_KEY`
- `AI_MODEL`
- `AI_BASE_URL`
- `AI_TIMEOUT_MS`

`AI_API_KEY` can be left empty if manual classification is desired.

## Run

Backend:
```bash
cd server
npm install
npm run dev
```

Frontend:
```bash
cd client
npm install
npm run dev
```

## Test

Use:
1. `Money was deducted from my account but my order was cancelled.`
2. `The website crashes whenever I upload a document.`
3. `My package has not arrived and it is three days late.`
4. `I have a question about my account.`

Also test AI failure by leaving `AI_API_KEY` empty. The complaint can still be created manually.

## Important design decision

AI is decision support, not the authority. The final category, priority and department are selected/reviewed by the user. The core complaint workflow works without AI.
