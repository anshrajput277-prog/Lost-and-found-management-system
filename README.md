# 🔍 Lost & Found Management System

<div align="center">

![Lost & Found Banner](https://img.shields.io/badge/Lost%20%26%20Found-Management%20System-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xNS41IDE0aC0uNzlsLS4yOC0uMjdBNi41IDYuNSAwIDAgMCAxNiA5LjUgNi41IDYuNSAwIDAgMCA5LjUgMyAyIDIgMCAwIDAgMyA5LjVhNi41IDYuNSAwIDAgMCA2LjUgNi41YzEuNjEgMCAzLjA5LS41OSA0LjIzLTEuNTdsLjI3LjI4di43OWw1IDQuOTlMMjAuNDkgMTlsLTQuOTktNXptLTYgMEM3LjAxIDE0IDUgMTEuOTkgNSA5LjVTNy4wMSA1IDkuNSA1IDE0IDcuMDEgMTQgOS41IDExLjk5IDE0IDkuNSAxNHoiLz48L3N2Zz4=)

[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io)

**A full-stack web application for managing Lost & Found items on a college campus.**  
Built with the MERN stack — MongoDB, Express, React, and Node.js.

[📋 Features](#-features) • [🛠️ Tech Stack](#️-tech-stack) • [🚀 Getting Started](#-getting-started) • [📡 API Reference](#-api-reference) • [📁 Project Structure](#-project-structure)

</div>

---

## 📋 Features

### 🔐 Authentication
- ✅ Secure **user registration** with bcrypt password hashing
- ✅ **JWT-based login** — token stored in localStorage
- ✅ **Protected routes** — dashboard only accessible after login
- ✅ **Logout** — clears token and redirects to login

### 📦 Item Management
- ✅ **Report a Lost item** with full details
- ✅ **Report a Found item** with location info
- ✅ **View all reported items** in a responsive card grid
- ✅ **Search items** by name, location, or type
- ✅ **Filter** items by Lost / Found / All
- ✅ **Update your own items** via an edit modal
- ✅ **Delete your own items** with confirmation
- ✅ **Ownership checks** — users can only edit/delete their own entries

### 🎨 UI / UX
- ✅ Premium **dark glassmorphism** design
- ✅ Smooth **animations & transitions**
- ✅ **Responsive** — works on mobile, tablet & desktop
- ✅ Color-coded badges — 🔴 Lost / 🟢 Found
- ✅ Live **stats bar** — total, lost, found counts

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6 |
| **HTTP Client** | Axios (with JWT interceptor) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Styling** | Vanilla CSS (Glassmorphism Design) |

---

## 📁 Project Structure

```
Lost-and-found-management-system/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js          # User schema (name, email, password)
│   │   │   └── Item.js          # Item schema (name, type, location...)
│   │   ├── routes/
│   │   │   ├── auth.js          # POST /register, POST /login
│   │   │   └── items.js         # Full CRUD + search
│   │   └── middleware/
│   │       └── authMiddleware.js # JWT verification
│   ├── server.js                # Express entry point
│   ├── .env.example             # Environment variable template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx        # Login page
    │   │   ├── Register.jsx     # Registration page
    │   │   └── Dashboard.jsx    # Main dashboard
    │   ├── utils/
    │   │   └── axios.js         # Axios instance with interceptors
    │   ├── App.jsx              # Router with route guards
    │   ├── main.jsx             # React entry point
    │   └── index.css            # Global styles
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally) or a [MongoDB Atlas](https://cloud.mongodb.com) URI
- [Git](https://git-scm.com/)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/anshrajput277-prog/Lost-and-found-management-system.git
cd Lost-and-found-management-system
```

### 2️⃣ Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/lostandfound
JWT_SECRET=your_super_secret_key_here
```

Start the backend server:

```bash
npm run dev
```

> ✅ Server runs at `http://localhost:5000`

### 3️⃣ Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

> ✅ App runs at `http://localhost:5173`

---

## 📡 API Reference

### Auth Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| `POST` | `/api/register` | Register a new user | ❌ |
| `POST` | `/api/login` | Login and receive JWT | ❌ |

**Register — Request Body:**
```json
{
  "name": "Ansh Sharma",
  "email": "ansh@college.edu",
  "password": "securepassword"
}
```

**Login — Request Body:**
```json
{
  "email": "ansh@college.edu",
  "password": "securepassword"
}
```

**Login — Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": "...", "name": "Ansh Sharma", "email": "ansh@college.edu" }
}
```

---

### Item Endpoints

> All item routes require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/items` | Report a new lost/found item |
| `GET` | `/api/items` | Get all items |
| `GET` | `/api/items/:id` | Get item by ID |
| `GET` | `/api/items/search?name=xyz` | Search items by name/location/type |
| `PUT` | `/api/items/:id` | Update item (owner only) |
| `DELETE` | `/api/items/:id` | Delete item (owner only) |

**Add Item — Request Body:**
```json
{
  "itemName": "Blue Backpack",
  "description": "Nike backpack with laptop compartment",
  "type": "Lost",
  "location": "Library 2nd Floor",
  "date": "2024-04-23",
  "contactInfo": "9876543210"
}
```

---

## 🗄️ MongoDB Schema

### User
```js
{
  name:     String (required),
  email:    String (required, unique),
  password: String (required, hashed with bcrypt)
}
```

### Item
```js
{
  itemName:    String (required),
  description: String (required),
  type:        String (enum: ['Lost', 'Found'], required),
  location:    String (required),
  date:        Date (default: now),
  contactInfo: String (required),
  postedBy:    ObjectId → ref: 'User'
}
```

---

## 🔒 Security

- Passwords are **hashed** using `bcryptjs` before storage — never stored in plain text
- All item routes are **protected by JWT middleware**
- Users can **only update or delete their own items** (403 if not owner)
- `.env` file is in `.gitignore` and never committed to GitHub
- Duplicate email registration returns a **409 Conflict** error
- Invalid login credentials return a generic **401** message (no email enumeration)

---

## 👤 Author

**Ansh Rajput**  
[![GitHub](https://img.shields.io/badge/GitHub-anshrajput277--prog-181717?style=flat&logo=github)](https://github.com/anshrajput277-prog)

---

## 📄 License

This project is for **educational purposes** as part of a Full Stack Development course assignment.

---

<div align="center">
  Made with ❤️ using the MERN Stack
</div>
