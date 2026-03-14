# PollPulse-Polling-App

# PollPulse

PollPulse is a real-time polling web application where users can create polls, vote, and view live results. The app is built with **React**, **Node.js/Express**, **MongoDB**, and **Socket.IO** for real-time updates.


## Features

- User authentication (Sign up / Log in) using JWT
- Create polls with multiple options
- Optional poll expiration
- Vote on polls and see live results instantly
- Dashboard for user polls
- Delete polls (only by creator)
- Responsive design

## Tech Stack

- **Frontend:** React, React Router DOM, CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Real-time updates:** Socket.IO
- **Authentication:** JWT


## Project Structure


PollPulse/
│
├─ client/                  # React frontend
│  ├─ src/
│  │  ├─ pages/             # Pages: CreatePoll.jsx, PollPage.jsx, Dashboard.jsx
│  │  ├─ components/        # Components: Navbar, PollCard, etc.
│  │  ├─ context/           # AuthContext.jsx
│  │  └─ App.jsx
│
├─ server/                  # Node.js backend
│  ├─ controllers/          # Logic: authController.js, pollController.js
│  ├─ models/               # MongoDB schemas: User.js, Poll.js
│  ├─ routes/               # Routes: auth.js, polls.js
│  └─ index.js              # Server entry point
│
├─ .env                     # Environment variables
├─ package.json
└─ README.md


## Setup Instructions

### Prerequisites

- Node.js >= 18
- MongoDB
- npm or yarn

### Clone the repo
git clone https://github.com/yourusername/pollpulse.git
cd pollpulse

### Backend Setup
cd server
npm install

Create `.env` in `server/`:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:3000
SOCKET_URL=http://localhost:5000


Start backend server:
npm run dev

### Frontend Setup
cd ../client
npm install

Create `.env` in `client/`:
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000

Start frontend:
npm start


Open [http://localhost:3000](http://localhost:3000) in your browser.



## Usage
1. Sign up or log in
2. Access the Dashboard to see polls
3. Click **Create Poll** to make a new poll
4. Vote on polls and view live results
5. Delete polls you created


## API Documentation

### Auth Routes

| Method | Endpoint             | Description              | Body                                    |
| ------ | -------------------- | ------------------------ | --------------------------------------- |
| POST   | `/api/auth/register` | Create new user          | `{ username, email, password }`         |
| POST   | `/api/auth/login`    | Log in user              | `{ email, password }`                   |
| GET    | `/api/auth/me`       | Get current user profile | Header: `Authorization: Bearer <token>` |

### Poll Routes

| Method | Endpoint              | Description                  | Body / Params                    |
| ------ | --------------------- | ---------------------------- | -------------------------------- |
| POST   | `/api/polls`          | Create a new poll            | `{ title, options, expiresAt? }` |
| GET    | `/api/polls`          | Get all polls                | —                                |
| GET    | `/api/polls/:id`      | Get poll by ID               | —                                |
| POST   | `/api/polls/:id/vote` | Vote on a poll               | `{ optionId }`                   |
| DELETE | `/api/polls/:id`      | Delete a poll (only creator) | —                                |

> **Note:** All endpoints requiring authentication need a **Bearer token** in the header.

## Real-Time Updates
PollPulse uses **Socket.IO** to provide instant vote updates:

* When a user votes, all connected clients automatically receive updated vote counts.
* This ensures live, synchronized results across users.

## Scripts

### Backend
npm run dev       # Start backend with nodemon
npm start         # Start backend in production

### Frontend
npm start         # Start React development server
npm run build     # Build production-ready frontend

## Contributing
1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add feature"`
4. Push branch: `git push origin feature/your-feature`
5. Open a pull request

## License
This project is licensed under the **MIT License**.

