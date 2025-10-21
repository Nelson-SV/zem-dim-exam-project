👨‍💼 ADMIN FEATURES

1️⃣ User / Client Management

Backend
	•	Create User (Client) — POST /api/users
	•	Validate required fields (email, first name, last name, password)
	•	Hash password + store salt
	•	Default role = “Client”
	•	Edit User — PUT /api/users/{id}
	•	Update name, phone, email, language, and active status
	•	Soft Delete User — DELETE /api/users/{id}
	•	Set IsActive = false instead of removing
	•	Get Users List — GET /api/users
	•	Paginated, filter by IsActive
	•	Get User Details — GET /api/users/{id}
	•	Unit tests for repository + service layer

Frontend
	•	Page /admin/clients
	•	Display table with users (search + filter)
	•	Show status (active/inactive)
	•	“Add Client” form (modal)
	•	“Edit Client” form (modal)
	•	“Deactivate Client” button (soft delete)
	•	Integrate API via React Query
	•	Toasts for success/error messages
	•	Validation feedback (missing fields, invalid email)
	•	UI language toggle (UA / EN)

⸻

2️⃣ Project Management

Backend
	•	Create Project — POST /api/projects
	•	Assign to existing client
	•	Store title, address, start/planned dates
	•	Edit Project — PUT /api/projects/{id}
	•	Update title, description, or dates
	•	Soft Delete Project — DELETE /api/projects/{id}
	•	Get All Projects — paginated
	•	Get Project Details — includes milestones + progress
	•	Recalculate progress based on milestones
	•	Validation rules (dates, progress ≤ 100)
	•	Add tests for repository and service

Frontend
	•	Page /admin/projects
	•	List or grid view with client, address, and progress
	•	“Create Project” form (assign client)
	•	“Edit Project” modal
	•	Project details page (tabs: info, milestones, media, chat)
	•	Progress bar visualization
	•	Client selector dropdown

⸻

3️⃣ Milestone / Construction Stages

Backend
	•	Create Milestone — POST /api/projects/{projectId}/milestones
	•	Edit Milestone — update title, status, progress
	•	Soft Delete Milestone — mark inactive
	•	Reorder Milestones (optional)
	•	Auto-update project progress when milestone changes

Frontend
	•	Milestones tab on project page
	•	Add/Edit milestone modal
	•	Progress slider (0–100%)
	•	Status badges (Pending / In Progress / Completed)
	•	Auto-refresh progress bar

⸻

4️⃣ Media & Files (Photos, 3D Scans, Documents)

Backend
	•	File upload to Google Cloud Storage
	•	Save file metadata (url, type, uploader)
	•	Endpoints:
	•	POST /api/projects/{id}/photos
	•	POST /api/projects/{id}/documents
	•	GET /api/projects/{id}/media
	•	DELETE /api/media/{id}
	•	Ensure proper permissions (Admin only)
	•	Test uploads and file deletion

Frontend
	•	File upload components (drag & drop / button)
	•	Gallery grid with thumbnails
	•	Document list with download links
	•	Delete button (confirmation modal)
	•	Upload progress bar
	•	Filter by milestone or media type

⸻

5️⃣ Communication (Real-Time Chat)

Backend
	•	Implement SignalR Hub for chat
	•	Store messages in database
	•	Emit events on new messages
	•	GET /api/messages/{projectId} — fetch conversation
	•	Restrict to authorized users (Admin ↔ Project client)

Frontend
	•	Chat UI (Admin ↔ Client)
	•	Real-time updates via SignalR
	•	Typing indicator
	•	Read receipts
	•	Scroll and “load more” history

⸻

6️⃣ Project Updates & Notifications

Backend
	•	Create “Update” entity for actions (milestone complete, photos added)
	•	GET /api/updates/{projectId} — fetch timeline
	•	NotificationService:
	•	Push via SignalR
	•	Store in DB
	•	Mark notifications as read

Frontend
	•	Notifications dropdown (bell icon)
	•	Highlight unread notifications
	•	Project timeline (“Recent Updates”)
	•	Toast popup for real-time alerts

⸻

👤 CLIENT FEATURES

1️⃣ Personal Dashboard

Backend
	•	GET /api/client/projects — projects for authenticated client
	•	Include progress %, milestones, latest updates

Frontend
	•	Page /client/dashboard
	•	Card view of projects (title, progress, current stage)
	•	“View Details” button → /client/project/:id
	•	Notifications widget (recent updates)
	•	Responsive layout for mobile

⸻

2️⃣ Project Details (Client View)

Backend
	•	GET /api/projects/{id} — visible only to assigned client
	•	Include milestones, photos, documents, and updates

Frontend
	•	Detailed project page
	•	Overview with progress bars
	•	Milestone accordion (status, completion date)
	•	Photo gallery grouped by stage
	•	Download company documents
	•	Integrated chat tab

⸻

3️⃣ Chat with Admin

Backend
	•	Use the same SignalR Hub
	•	Restrict by project ID (client ↔ assigned admin)
	•	Persist messages in DB

Frontend
	•	Chat component for client
	•	Real-time updates via SignalR
	•	Message history
	•	Notification for new admin messages

⸻

4️⃣ Document Uploads

Backend
	•	POST /api/client/documents
	•	Mark as IsVisibleToAdmin = true
	•	Allow delete by uploader
	•	GET /api/client/documents

Frontend
	•	“My Documents” page/tab
	•	Upload PDF, DOCX, JPG, etc.
	•	Download & delete options
	•	Upload progress bar
	•	File validation (type, size)

⸻

5️⃣ Cost Calculator

Backend
	•	POST /api/calculator/estimate
	•	Inputs: area, foundation, wall material, roof type, finishing, floors
	•	Returns estimated range + breakdown

Frontend
	•	Page /client/calculator
	•	Form UI with inputs
	•	Validate numeric area
	•	Display cost range and breakdown
	•	“Request Consultation” button

⸻

6️⃣ Profile Management

Backend
	•	GET /api/client/profile
	•	PUT /api/client/profile
	•	Update name, phone, language, profile image

Frontend
	•	Page /client/profile
	•	Editable form for personal data
	•	Avatar upload
	•	Language selector (UA/EN)
	•	Save confirmation feedback

⸻

🔒 COMMON FEATURES (Both Roles)
	•	Authentication (JWT Login)
	•	Role-based route protection
	•	Refresh token handling
	•	Multi-language support (UA / EN)
	•	Responsive design (desktop / tablet / mobile)
	•	Dark mode toggle
	•	Global error handling
	•	Toast notifications for status feedback