# Political Canvas

## Overview

Political Canvas is a full-stack application for managing political canvassing operations, including voter management, canvassing logs, walklists, and territory assignments. The project consists of a React + TypeScript frontend and a Node.js + Express backend with a MySQL database.

---

## Database Schema

The backend uses the following tables (see `server/schema.sql`):

| Table        | Description                                      | Used By Features |
|--------------|--------------------------------------------------|------------------|
| users        | Stores user accounts and roles                   | Auth, Territory, Logs |
| voters       | Stores voter details                             | Voter CRUD, Exit Poll, Logs |
| logs         | Stores canvassing logs for each voter/user        | Logs, Sync |
| walklists    | Stores walklist filters and names                | Walklist CRUD |
| territories  | Stores territory assignments to users             | Territory CRUD |

---

## Implemented Features

### Authentication & Authorization

- User registration (admin only) and login (all users)
- JWT-based authentication
- Role-based access: `admin`, `manager`, `volunteer`

### Voter Management

- View all voters (all roles)
- Add, edit voters (admin, manager)
- Delete voters (admin)
- Voter fields: name, address, age, gender, party, leaning, consent

### Exit Poll

- View party-wise vote counts and percentages (all roles)
- Uses `voters` table

### Canvassing Logs

- View all logs (all roles)
- Add logs (all roles, volunteers can only add for themselves)
- Sync logs (all roles, volunteers can only sync their own)
- Log fields: voter, user, sentiment, issues, notes, timestamp

### Walklists

- View all walklists (all roles)
- Create walklists (admin, manager)
- Walklist fields: name, filter

### Territories

- View all territories (all roles)
- Assign territories (admin, manager)
- Territory fields: name, assigned_to (user)

---

## Feature-to-Schema Mapping

| Feature         | Tables Used      |
|-----------------|-----------------|
| Auth/Login      | users           |
| Voter CRUD      | voters          |
| Exit Poll       | voters          |
| Logs            | logs, users, voters |
| Walklists       | walklists       |
| Territories     | territories, users |
| Sync            | logs, users     |

---

## In-Progress / Planned Features

- **Logs UI:** Frontend UI for viewing and adding canvassing logs
- **Walklists UI:** Frontend for creating and managing walklists
- **Territories UI:** Frontend for assigning and viewing territories
- **Offline Sync UI:** Frontend for syncing logs when offline
- **Role Management:** UI for admin to manage user roles
- **Analytics/Dashboard:** Visualizations for voter and canvassing data
- **Enhanced Filtering:** Advanced filters for voters and logs

---

## How to Run

1. **Backend**

- Go to `server/`
- Install dependencies: `npm install`
- Start server: `npm run dev` (default port 4000)

2. **Frontend**

- Go to `political-canvas/`
- Install dependencies: `npm install`
- Start dev server: `npm run dev` (default port 5173)

3. **Database**

- Ensure MySQL is running
- Run the schema in `server/schema.sql`
- (Optional) Add sample voters: `node add_sample_voters.js` in `server/`

---

## Project Structure

```text
DBMS Project/
├── political-canvas/      # React frontend
├── server/                # Node.js backend (MySQL)
├── server-postgres/       # (Alternative backend, WIP)
├── server-unified/        # (Alternative backend, WIP)
└── README.md              # Project overview
```
