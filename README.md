# 📝 Notes App – Three-Tier Application (Frontend + Backend + DB)
### This is a **three-tier Notes App*** built using:
---

**Frontend:** React + Axios

**Backend:** Node.js + Express

**Database:** MongoDB

### It is designed to demonstrate full-stack deployment and DevOps practices using Docker, Docker Compose, and CI/CD via Jenkins.
---

## 📁 Project Structure

## notes-app/
```text .
notes-app/
├── frontend/        # React frontend
├── backend/         # Node.js + Express backend
├── docker-compose.yml
└── Jenkinsfile      # Declarative Jenkins Pipeline
```

---

## 🚀 Local Setup
### 🔧 Backend
```bash
cd backend
npm install
npm run dev
```

#### Make sure MongoDB is running locally at mongodb://localhost:27017/notesapp

### 💻 Frontend
```bash
cd frontend
npm install
npm start
```

---

## 📦 Dockerized Setup (Recommended for Production)
### Run everything using Docker Compose:

```bash
docker-compose up --build -d
```
This will bring up:

MongoDB
Backend server
Frontend React app

---

## 🔁 Jenkins CI/CD (via Jenkinsfile)
The included Jenkinsfile automates:
Git checkout
Docker Compose build and deploy
Can be triggered from Jenkins configured on the EC2 server (refer to infra repo).

---

## 📡 API Endpoints

| Method | Endpoint         | Description             |
| ------ | ---------------- | ----------------------- |
| GET    | `/api/notes`     | Fetch all notes         |
| GET    | `/api/notes/:id` | Fetch single note       |
| POST   | `/api/notes`     | Create a new note       |
| PUT    | `/api/notes/:id` | Update an existing note |
| DELETE | `/api/notes/:id` | Delete a note           |

---

## 🔮 Next Steps / Enhancements
Add user authentication & login
Integrate monitoring and logging (Prometheus, ELK, etc.)
Add HTTPS with Nginx reverse proxy
Unit and integration tests

---

📬 **Contact**  
Created by: **Uday Chopade**  
📧 [LinkedIn](https://www.linkedin.com/in/udaychopade27) | 🗂️ [GitHub](https://github.com/udaychopade27)

---

🔗 Also check: [Infrastructure Repo](https://github.com/udaychopade27/devsecops-project.git)
