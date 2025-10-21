# 👨‍💼 ADMIN FEATURES

## 1️⃣ User / Client Management

**Backend**
- [ ] Create User (Client) — `POST /api/users`
  - [ ] Validate required fields (email, first name, last name, password)
  - [ ] Hash password + store salt
  - [ ] Default role = “Client”
- [ ] Edit User — `PUT /api/users/{id}`
  - [ ] Update name, phone, email, language, and active status
- [ ] Soft Delete User — `DELETE /api/users/{id}`
  - [ ] Set `IsActive = false` instead of removing
- [ ] Get Users List — `GET /api/users` (paginated, filter by `IsActive`)
- [ ] Get User Details — `GET /api/users/{id}`
- [ ] Write unit tests for repository + service layer

**Frontend**
- [ ] Create `/admin/clients` page
  - [ ] Display table with users (search + filter)
  - [ ] Show status (active/inactive)
  - [ ] Add “Add Client” modal
  - [ ] Add “Edit Client” modal
  - [ ] Add “Deactivate Client” button (soft delete)
- [ ] Integrate with API via React Query
- [ ] Add success/error toasts
- [ ] Add validation feedback (missing fields, invalid email)
- [ ] Add UI language toggle (UA / EN)

---

## 2️⃣ Project Management

**Backend**
- [ ] Create Project — `POST /api/projects`
  - [ ] Assign to existing client
  - [ ] Store title, address, start/planned dates
- [ ] Edit Project — `PUT /api/projects/{id}`
  - [ ] Update title, description, or dates
- [ ] Soft Delete Project — `DELETE /api/projects/{id}`
- [ ] Get All Projects — paginated
- [ ] Get Project Details — includes milestones + progress
- [ ] Recalculate progress based on milestones
- [ ] Add validation rules (dates, progress ≤ 100)
- [ ] Add tests for repository and service layer

**Frontend**
- [ ] Create `/admin/projects` page
  - [ ] List or grid view with client, address, and progress
  - [ ] “Create Project” form (assign client)
  - [ ] “Edit Project” modal
  - [ ] Project detail page (tabs: info, milestones, media, chat)
- [ ] Add progress bar visualization
- [ ] Add client selector dropdown

---

## 3️⃣ Milestone / Construction Stages

**Backend**
- [ ] Create Milestone — `POST /api/projects/{projectId}/milestones`
- [ ] Edit Milestone — update title, status, progress
- [ ] Soft Delete Milestone — mark inactive
- [ ] Reorder Milestones (optional)
- [ ] Auto-update project progress when milestone changes

**Frontend**
- [ ] Add milestones tab on project page
- [ ] Add/Edit milestone modal
- [ ] Add progress slider (0–100%)
- [ ] Add status badges (Pending / In Progress / Completed)
- [ ] Auto-refresh progress bar

---

## 4️⃣ Media & Files (Photos, 3D Scans, Documents)

**Backend**
- [ ] Upload files to Google Cloud Storage
- [ ] Save file metadata (url, type, uploader)
- [ ] Implement endpoints:
  - [ ] `POST /api/projects/{id}/photos`
  - [ ] `POST /api/projects/{id}/documents`
  - [ ] `GET /api/projects/{id}/media`
  - [ ] `DELETE /api/media/{id}`
- [ ] Enforce permissions (Admin only)
- [ ] Test uploads and deletions

**Frontend**
- [ ] Add file upload components (drag & drop / button)
- [ ] Create gallery grid with thumbnails
- [ ] Add document list with download links
- [ ] Add delete button (confirmation modal)
- [ ] Add upload progress bar
- [ ] Add filters by milestone or media type

---

## 5️⃣ Communication (Real-Time Chat)

**Backend**
- [ ] Implement SignalR Hub for chat
- [ ] Store messages in DB
- [ ] Emit new message events
- [ ] `GET /api/messages/{projectId}` — fetch conversation
- [ ] Restrict to authorized project participants

**Frontend**
- [ ] Build chat UI (Admin ↔ Client)
- [ ] Add live updates with SignalR
- [ ] Add typing indicator
- [ ] Add read receipts
- [ ] Add scroll + “load more” for message history