# ResolveX - Implemented Enhancements

## Notifications
- Complaint created -> customer in-app notification
- Complaint assigned -> assigned agent in-app notification
- Complaint resolved -> customer in-app notification
- SLA breached -> admin in-app notification
- Notifications are persisted in MongoDB and include read/unread state.
- Notification bell polls for new notifications every 30 seconds.

## Gmail Resolution Email
Configure these optional variables in `server/.env`:

```env
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_google_app_password
```

`EMAIL_PASS` must be a Google App Password, not the normal Gmail password.

When a complaint changes to `RESOLVED`, ResolveX:
1. Saves the resolution and `resolvedAt`.
2. Creates the customer's in-app notification.
3. Attempts to send the resolution email.
4. Does not fail the complaint update if Gmail is unavailable.

## SLA Monitoring
The server checks active complaints every 5 minutes. When `slaDueAt` passes:
- `slaBreachedAt` is recorded.
- A `SLA_BREACHED` history entry is added.
- All admins receive an in-app notification.
- The same complaint is not notified repeatedly.

## Admin Analytics
Admin dashboard now calculates:
- Total, open, resolved, closed, SLA breached
- Average resolution time
- Complaint trends
- Category distribution
- Agent assigned/resolved/pending workload
- SLA health: within SLA, due soon, breached

No sample dashboard numbers are hard-coded.

## Duplicate Complaint Detection
When a customer submits a complaint, ResolveX compares it with the customer's active complaints using token/Jaccard similarity.

If a likely duplicate is found:
- The customer sees the existing complaint ID, status and similarity percentage.
- They can view the existing complaint.
- They can still explicitly choose `Create New Anyway`.

The backend also performs the duplicate check, so it is not only a frontend feature.

## Demo Users

After `npm run seed`:

- Admin: `admin@resolvex.com`
- Agents: `rahul@resolvex.com`, `priya@resolvex.com`, `amit@resolvex.com`
- Customer: `customer@resolvex.com`
- Password: `123456`

Change demo credentials before any real deployment.
