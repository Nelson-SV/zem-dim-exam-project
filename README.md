## Notes
- for testing, use the email "testuser.nelito123@proton.me" when creating client


## 👨‍💼 ADMIN FEATURES

### 1️⃣ User / Client Management

**Backend**
- [x] Create User (Client) — `POST /api/users`
  - [x] Validate required fields (email, first name, last name, password)
  - [x] Hash password + store salt
  - [x] Default role = “Client”
- [x] Edit User — `PUT /api/users/{id}`
  - [x] Update name, phone, email, language, and active status
- [x] Soft Delete User — `DELETE /api/users/{id}`
  - [x] Set `IsActive = false` instead of removing
- [x] Get Users List — `GET /api/users` (paginated, filter by `IsActive`)
- [x] Get User Details — `GET /api/users/{id}`
- [ ] Unit tests for repository + service layer

**Frontend**
- [x] Create `/admin/clients` page
  - [x] Display table with users (search)
  - [x] Show status (active/inactive)
  - [x] Add “Add Client” modal
  - [x] Add “Edit Client” modal
  - [x] Add “Deactivate Client” button (soft delete)
- [x] Integrate with API via React Query
- [x] Add success/error toasts
- [x] Add validation feedback (missing fields, invalid email)
- [x] Add UI language toggle (UA / EN)

---

### 2️⃣ Project Management

**Backend**
- [x] Create Project — `POST /api/projects`
  - [x] Assign to existing client
  - [x] Store title, address, start/planned dates
- [x] Edit Project — `PUT /api/projects/{id}`
  - [x] Update title, description, or dates
- [x] Soft Delete Project — `DELETE /api/projects/{id}`
- [x] Get All Projects — paginated
- [x] Get Project Details — includes milestones + progress
- [ ] Recalculate progress based on milestones
- [ ] Validation rules (dates, progress ≤ 100)
- [ ] Unit/integration tests

**Frontend**
- [x] Create `/admin/projects` page
  - [x] Grid or table view with client, address, progress
  - [x] “Create Project” form (assign client)
  - [x] “Edit Project” modal
  - [x] Project detail page (tabs: info, milestones, media, chat)
- [x] Add progress bar visualization

---

### 3️⃣ Milestone / Construction Stages

**Backend**
- [x] Create Milestone — `POST /api/projects/{projectId}/milestones`
- [x] Edit Milestone — update title, status, progress
- [x] Soft Delete Milestone — mark inactive
- [ ] Reorder Milestones (optional)
- [x] Auto-update project progress when milestone changes

**Frontend**
- [x] Milestones tab on project page
- [x] Add/Edit milestone modal
- [x] Add progress slider (0–100%)
- [x] Add status badges (In Progress / Completed)
- [x] Auto-refresh project progress bar

---

### 4️⃣ Media & Files (Photos, 3D Scans, Documents)

**Backend**
- [x] Implement file upload to Supabase Storage
- [x] Save metadata (url, type, uploader)
- [x] Create endpoints:
  - [x] `POST /api/projects/{id}/photos`
  - [x] `POST /api/projects/{id}/documents`
  - [x] `GET /api/projects/{id}/media`
  - [x] `DELETE /api/media/{id}`
- [x] Ensure permissions (Admin only)
- [ ] Test upload and deletion logic

**Frontend**
- [x] Add upload components (drag & drop / button)
- [x] Gallery grid with thumbnails
- [x] Document list with download links
- [x] Delete button (confirmation modal)
- [x] Upload progress bar
- [x] Filter by milestone or file type

---

### 5️⃣ Communication (Real-Time Chat)

**Backend**
- [x] Implement SignalR Hub for chat
- [x] Store messages in database
- [x] Emit “new message” events
- [x] `GET /api/messages/{projectId}` — fetch conversation
- [x] Restrict to authorized participants

**Frontend**
- [x] Chat UI (Admin ↔ Client)
- [x] Live updates via SignalR
- [x] Typing indicator
- [x] Read receipts
- [x] Scroll and “load more” history

---

### 6️⃣ Project Updates & Notifications

**Backend**
- [x] Create “Update” entity (milestone completed, photos added, etc.)
- [x] `GET /api/updates/{projectId}` — fetch timeline
- [x] NotificationService:
  - [x] Push via SignalR
  - [x] Store in database
- [x] Mark notifications as read

**Frontend**
- [x] Add notifications dropdown (bell icon)
- [x] Highlight unread notifications
- [x] Project timeline (“Recent Updates”)
- [x] Toast pop-up for real-time alerts

---

## 👤 CLIENT FEATURES

### 1️⃣ Personal Dashboard

**Backend**
- [x] `GET /api/client/projects` — fetch projects for logged-in client
  - [x] Include progress %, milestones, and latest updates

**Frontend**
- [x] `/client/dashboard` page
  - [x] Display cards with project info (title, progress, current stage)
  - [x] “View Details” button → `/client/project/:id`
  - [x] Notifications widget
  - [x] Responsive layout (desktop/tablet/mobile)

---

### 2️⃣ Project Details (Client View)

**Backend**
- [x] `GET /api/projects/{id}` — only if user is assigned client
  - [x] Return milestones, photos, documents, updates

**Frontend**
- [x] Project overview page
  - [x] Display progress bars
  - [x] Milestones accordion (status, dates)
  - [x] Photo gallery grouped by stage
  - [x] Downloadable company documents
  - [x] Integrated chat tab

---

### 3️⃣ Chat with Admin

**Backend**
- [x] Use shared SignalR Hub
- [x] Restrict visibility by project
- [x] Save messages to database

**Frontend**
- [x] Client-side chat component
- [x] Auto-scroll to newest message
- [x] Real-time updates via SignalR
- [x] Unread indicator on navbar

---

### 4️⃣ Document Uploads

**Backend**
- [x] `POST /api/client/documents`
- [x] Mark `IsVisibleToAdmin = true`
- [x] Allow deletion by uploader
- [x] `GET /api/client/documents`

**Frontend**
- [x] “My Documents” page/tab
- [x] Upload (PDF, DOCX, JPG, etc.)
- [x] Download & delete buttons
- [x] Upload progress bar
- [x] Validate file type and size

---

### 6️⃣ Profile Management

**Backend**
- [x] `GET /api/client/profile`
- [x] `PUT /api/client/profile`
  - [x] Update name, phone, language, and avatar

**Frontend**
- [x] `/client/profile` page
  - [x] Editable form for user data
  - [x] Avatar upload
  - [x] Language selector (UA/EN)
  - [x] Confirmation toast on save

---

## 🔒 COMMON FEATURES

**Both**
- [x] Authentication (JWT Login)
- [x] Role-based route protection
- [ ] Refresh token handling
- [x] Multi-language support (UA / EN)
- [x] Responsive design (desktop/tablet/mobile)
- [x] Dark mode toggle
- [x] Global error handling
- [x] Toast notifications for all actions

---