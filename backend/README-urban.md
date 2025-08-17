
# Urban Infrastructure Backend – API Quickstart

This adds issue tracking on top of your existing auth skeleton.

## Routes

- `POST /api/auth/register` – create user
- `POST /api/auth/login` – login
- `GET /api/auth/profile` – get my profile (Bearer token)
- `PUT /api/auth/profile` – update my profile

### Issues (Bearer token required)
- `POST /api/issues` – create issue
- `GET /api/issues` – list (query: status, type, q, assignedTo, reporter, lng, lat, maxDistance, page, limit)
- `GET /api/issues/:id` – get one
- `PUT /api/issues/:id` – update fields
- `PATCH /api/issues/:id/status` – change status
- `DELETE /api/issues/:id` – soft delete

### Comments (nested)
- `POST /api/issues/:issueId/comments` – add comment
- `GET /api/issues/:issueId/comments` – list comments

### Work Orders
- `POST /api/workorders` – create (requires issue & assignee)
- `GET /api/workorders` – list (query: issue, assignee)
- `PUT/PATCH /api/workorders/:id` – update

## MongoDB Geo Index
Ensure the `Issue` collection builds the `2dsphere` index. On first run Mongoose will create it.

## Env
- `MONGO_URI=mongodb://localhost:27017/urban`
- `JWT_SECRET=change-me`
- `PORT=5001`

