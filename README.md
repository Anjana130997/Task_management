# 🗂️ Task Management System

A full-stack **Task Management Web Application** that allows users to **create, assign, and track tasks**, manage files, and add comments — built using **React (frontend)** and **Express + JSON-based DB (backend)**.

---

## 🚀 Features
- 🔐 JWT-based authentication
- ✅ CRUD for tasks
- 💬 Comment system (no anonymous comments)
- 📎 File uploads & downloads
- 👀 Role-based access for creators and assignees
- 🎨 Clean responsive UI with React

---

## ⚙️ Setup Instructions

### 📦 Clone the Repository
git clone https://github.com/Anjana130997/Task_management.git
cd Task_management
🧭 Folder Structure
.
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── utils/
│   ├── db.json
│   ├── uploads/
│   └── server.js
└── frontend/
    ├── src/
    ├── public/
    └── vite.config.js

🧩 How to Run the Application
Start the Backend
cd backend
npm install
npm run dev
Server runs at: http://localhost:4000

Start the Frontend
cd frontend
npm install
npm run dev
App runs at: http://localhost:5173

🧠 Architecture Decisions
LowDB (JSON) instead of SQL or MongoDB
Used for simplicity and portability — ideal for small demo projects.

JWT Authentication
Secure token-based authentication that works statelessly with Axios interceptors.

Multer for file uploads
Stores files in /uploads and keeps metadata in db.json.

Frontend state management
Used React Context (AuthContext) instead of Redux to keep it lightweight.

Routing
Used react-router-dom for navigation between login, signup, and dashboard pages.

💭 Assumptions Made
Each user can only see their own tasks or tasks assigned to them.

Only task creator or assignee can comment.

File uploads are small (<5MB).

JSON-based database is sufficient for this project scale.

App will run locally for demo purposes (not deployed).

🧾 API Documentation
Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login existing user
GET	/api/auth/profile	Get logged-in user info

Tasks
Method	Endpoint	Description
GET	/api/tasks	Get all tasks
GET	/api/tasks/:id	Get single task
POST	/api/tasks	Create new task
PUT	/api/tasks/:id	Update task
DELETE	/api/tasks/:id	Delete task

Comments
Method	Endpoint	Description
GET	/api/comments/:taskId	Get comments for a task
POST	/api/comments/:taskId	Add a comment
PUT	/api/comments/:commentId	Update comment
DELETE	/api/comments/:commentId	Delete comment

Files
Method	Endpoint	Description
POST	/api/tasks/:id/files	Upload files
GET	/uploads/:filename	Download file
DELETE	/api/files/:fileId	Delete file

🔑 Test User Credentials
Use these credentials to test the app (after signup or by importing manually into db.json):
Email: testuser@example.com
Password: 123456

Copy code
Email: testuser@example.com
Password: 123456
