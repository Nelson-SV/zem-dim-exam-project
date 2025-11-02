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
- [ ] Get Users List — `GET /api/users` (paginated, filter by `IsActive`)
- [ ] Get User Details — `GET /api/users/{id}`
- [ ] Unit tests for repository + service layer

**Frontend**
- [x] Create `/admin/clients` page
  - [ ] Display table with users (search + filter)
  - [x] Show status (active/inactive)
  - [x] Add “Add Client” modal
  - [ ] Add “Edit Client” modal
  - [ ] Add “Deactivate Client” button (soft delete)
- [x] Integrate with API via React Query
- [x] Add success/error toasts
- [x] Add validation feedback (missing fields, invalid email)
- [x] Add UI language toggle (UA / EN)

---

### 2️⃣ Project Management

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
- [ ] Validation rules (dates, progress ≤ 100)
- [ ] Unit/integration tests

**Frontend**
- [ ] Create `/admin/projects` page
  - [ ] Grid or table view with client, address, progress
  - [ ] “Create Project” form (assign client)
  - [ ] “Edit Project” modal
  - [ ] Project detail page (tabs: info, milestones, media, chat)
- [ ] Add progress bar visualization
- [ ] Add client selector dropdown

---

### 3️⃣ Milestone / Construction Stages

**Backend**
- [ ] Create Milestone — `POST /api/projects/{projectId}/milestones`
- [ ] Edit Milestone — update title, status, progress
- [ ] Soft Delete Milestone — mark inactive
- [ ] Reorder Milestones (optional)
- [ ] Auto-update project progress when milestone changes

**Frontend**
- [ ] Milestones tab on project page
- [ ] Add/Edit milestone modal
- [ ] Add progress slider (0–100%)
- [ ] Add status badges (Pending / In Progress / Completed)
- [ ] Auto-refresh project progress bar

---

### 4️⃣ Media & Files (Photos, 3D Scans, Documents)

**Backend**
- [ ] Implement file upload to Google Cloud Storage
- [ ] Save metadata (url, type, uploader)
- [ ] Create endpoints:
  - [ ] `POST /api/projects/{id}/photos`
  - [ ] `POST /api/projects/{id}/documents`
  - [ ] `GET /api/projects/{id}/media`
  - [ ] `DELETE /api/media/{id}`
- [ ] Ensure permissions (Admin only)
- [ ] Test upload and deletion logic

**Frontend**
- [ ] Add upload components (drag & drop / button)
- [ ] Gallery grid with thumbnails
- [ ] Document list with download links
- [ ] Delete button (confirmation modal)
- [ ] Upload progress bar
- [ ] Filter by milestone or file type

---

### 5️⃣ Communication (Real-Time Chat)

**Backend**
- [ ] Implement SignalR Hub for chat
- [ ] Store messages in database
- [ ] Emit “new message” events
- [ ] `GET /api/messages/{projectId}` — fetch conversation
- [ ] Restrict to authorized participants

**Frontend**
- [ ] Chat UI (Admin ↔ Client)
- [ ] Live updates via SignalR
- [ ] Typing indicator
- [ ] Read receipts
- [ ] Scroll and “load more” history

---

### 6️⃣ Project Updates & Notifications

**Backend**
- [ ] Create “Update” entity (milestone completed, photos added, etc.)
- [ ] `GET /api/updates/{projectId}` — fetch timeline
- [ ] NotificationService:
  - [ ] Push via SignalR
  - [ ] Store in database
- [ ] Mark notifications as read

**Frontend**
- [ ] Add notifications dropdown (bell icon)
- [ ] Highlight unread notifications
- [ ] Project timeline (“Recent Updates”)
- [ ] Toast pop-up for real-time alerts

---

## 👤 CLIENT FEATURES

### 1️⃣ Personal Dashboard

**Backend**
- [ ] `GET /api/client/projects` — fetch projects for logged-in client
  - [ ] Include progress %, milestones, and latest updates

**Frontend**
- [ ] `/client/dashboard` page
  - [ ] Display cards with project info (title, progress, current stage)
  - [ ] “View Details” button → `/client/project/:id`
  - [ ] Notifications widget
  - [ ] Responsive layout (desktop/tablet/mobile)

---

### 2️⃣ Project Details (Client View)

**Backend**
- [ ] `GET /api/projects/{id}` — only if user is assigned client
  - [ ] Return milestones, photos, documents, updates

**Frontend**
- [ ] Project overview page
  - [ ] Display progress bars
  - [ ] Milestones accordion (status, dates)
  - [ ] Photo gallery grouped by stage
  - [ ] Downloadable company documents
  - [ ] Integrated chat tab

---

### 3️⃣ Chat with Admin

**Backend**
- [ ] Use shared SignalR Hub
- [ ] Restrict visibility by project
- [ ] Save messages to database

**Frontend**
- [ ] Client-side chat component
- [ ] Auto-scroll to newest message
- [ ] Real-time updates via SignalR
- [ ] Unread indicator on navbar

---

### 4️⃣ Document Uploads

**Backend**
- [ ] `POST /api/client/documents`
- [ ] Mark `IsVisibleToAdmin = true`
- [ ] Allow deletion by uploader
- [ ] `GET /api/client/documents`

**Frontend**
- [ ] “My Documents” page/tab
- [ ] Upload (PDF, DOCX, JPG, etc.)
- [ ] Download & delete buttons
- [ ] Upload progress bar
- [ ] Validate file type and size

---

### 5️⃣ Cost Calculator

**Backend**
- [ ] `POST /api/calculator/estimate`
  - [ ] Accept: area, foundation, wall material, roof type, finishing, floors
  - [ ] Return estimated range + breakdown

**Frontend**
- [ ] `/client/calculator` page
  - [ ] Input form for area, material, etc.
  - [ ] Validate area (must be numeric)
  - [ ] Display price range + breakdown
  - [ ] Add “Request Consultation” button

---

### 6️⃣ Profile Management

**Backend**
- [ ] `GET /api/client/profile`
- [ ] `PUT /api/client/profile`
  - [ ] Update name, phone, language, and avatar

**Frontend**
- [ ] `/client/profile` page
  - [ ] Editable form for user data
  - [ ] Avatar upload
  - [ ] Language selector (UA/EN)
  - [ ] Confirmation toast on save

---

## 🔒 COMMON FEATURES

**Both**
- [ ] Authentication (JWT Login)
- [ ] Role-based route protection
- [ ] Refresh token handling
- [ ] Multi-language support (UA / EN)
- [ ] Responsive design (desktop/tablet/mobile)
- [ ] Dark mode toggle
- [ ] Global error handling
- [ ] Toast notifications for all actions

---

## 🧭 Recommended Development Order

1. **Admin — User CRUD**
2. **Admin — Projects CRUD**
3. **Admin — Milestones**
4. **Client — Dashboard + Project View**
5. **File Uploads + Media**
6. **SignalR Chat + Notifications**
7. **Cost Calculator + Profile**
8. **Final polish + Deployment**

---

> ✅ Tip: To mark progress, edit this file and change `[ ]` → `[x]` next to completed tasks.  
> GitHub will automatically render interactive checkboxes.