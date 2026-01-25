# 🎓 LMS Platform (Under Development)

A modern **Learning Management System (LMS)** built using the MERN stack with a scalable architecture, modular routing, authentication system, and a production‑grade frontend setup.

> 🚧 **Project Status:** Under active development — features are being implemented incrementally and the system is not yet production‑ready.

---

## 🔹 Overview

This project aims to deliver a full‑fledged LMS platform supporting:

* Secure authentication
* Role‑based dashboards (Student / Instructor / Admin)
* Course creation & enrollment
* Progress tracking
* Modern UI with theme support (light / dark)

The system is being designed with **scalability, maintainability, and real‑world production patterns** in mind.

---

## 🧩 Tech Stack

### Frontend

* React (Modern Router – `createBrowserRouter`)
* Material UI (MUI)
* Context API (Theme & Auth)
* Axios (central API client)

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

### Tooling

* dotenv for environment management
* Git & GitHub for version control

---

## ✨ Current Features

* 🔐 Authentication layout (Login / Signup in shared layout)
* 🧭 Modern routing with nested layouts
* 🎨 Theme system with Light / Dark mode
* ⚙️ Central axios configuration
* 🧱 Modular folder structure (layouts, routes, pages, api, context)

---

## 🚀 Planned Features

* Role‑based access (Student / Instructor / Admin)
* Course management
* Video lessons & materials
* Progress & completion tracking
* Dashboard analytics
* Payment integration
* Email verification & password reset

---

## 📁 Project Structure (Frontend)

```
src/
 ├─ api/            # Axios & API helpers
 ├─ layouts/        # Page shells (AuthLayout, DashboardLayout)
 ├─ pages/          # Screens (Login, Signup, Dashboard, Courses)
 ├─ routes/         # Router configuration
 ├─ context/        # Theme & Auth contexts
 ├─ components/    # Reusable UI components
 ├─ App.jsx         # Global providers
 └─ main.jsx        # Entry with RouterProvider
```

---

## ⚙️ Environment Setup

Create a `.env.local` file in both frontend and backend roots.

### Frontend `.env.local`

```
REACT_APP_API_BASE_URL=http://localhost:5000
```

### Backend `.env.local`

```
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
```

---

## ▶️ Running the Project

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🧠 Architecture Highlights

* Modern router architecture using `createBrowserRouter`
* Layout‑based routing for authentication & dashboards
* Context for UI configuration (theme, auth)
* Production‑grade provider layering
* Environment‑driven configuration

---

## 🗺️ Roadmap

* [ ] Backend authentication complete
* [ ] Protected dashboard routes
* [ ] Course schema & APIs
* [ ] Enrollment flow
* [ ] Instructor panel
* [ ] Deployment setup

---

## 👨‍💻 Author

**Himanshu Upadhyay**
MCA Graduate | MERN Stack Developer
LinkedIn: [https://www.linkedin.com/in/himanshuam](https://www.linkedin.com/in/himanshuam)
GitHub: [https://github.com/RyzenHim](https://github.com/RyzenHim)

---

## 📜 License

This project is currently under private development. Licensing details will be added once the project reaches a stable release.

---

## ⚠️ Disclaimer

This project is under active development. Features, structure, and APIs may change as the system evolves.

---

⭐ If you find this project interesting, feel free to follow the progress and provide feedback.
