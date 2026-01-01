# CampusEvents - Campus Event Management System

<img src="/client/assets/logo.jpeg" alt="Alt text" width="300" height="200">

## preview
<img src="./client/assets/preview.png" height="500"/>

A comprehensive event management platform designed for campus communities to create, discover, and register for events.

## Project Description

CampusEvents is a full-stack web application that allows users to browse, discover, and register for campus events. The platform provides a user-friendly interface for event discovery and management, enabling students and organizations to connect through various campus activities and events.

## Tech Stack

### Frontend

- **HTML5** - Markup structure
- **JavaScript (Vanilla)** - Client-side interactivity
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Google Fonts** - Typography (Inter font family)

### Backend

- **Node.js** (v22.x) - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM (Object Data Modeling)
- **CORS** - Cross-Origin Resource Sharing middleware
- **Dotenv** - Environment variable management

### Development Tools

- **Nodemon** - Auto-reload during development
- **Vercel** - Deployment platform

## Folder Structure

```
capmus-events-complete/
├── client/                     # Frontend application
│   ├── assets/                 # Static assets (images, icons, logos, etc.)
│   │   ├── logo.jpeg           # Main logo used in README and UI
│   │   ├── logo-title.jpeg     # Title/wordmark variant of the logo
│   │   └── ...other assets     # Additional images or static files
│   ├── index.html              # Main landing page
│   ├── dashboard.html          # Dashboard page
│   ├── config.js               # Client configuration (API base URL, etc.)
│   ├── script.js               # Main client-side script for landing page
│   ├── dashboard.js            # Dashboard functionality and event logic
│   └── .gitignore              # Git ignore rules for client
│
├── server/                     # Backend application
│   ├── server.js               # Main server file
│   ├── package.json            # Node.js dependencies and scripts
│   ├── vercel.json             # Vercel deployment config
│   ├── models/                 # Database models
│   │   ├── Event.js            # Event model schema
│   │   └── User.js             # User model schema
│   └── .env                    # Environment variables (not in repo)
│
└── README.md                   # Project documentation
```

## Key Features

- **Event Discovery** - Browse and filter campus events
- **User Registration** - Register for events with email
- **Event Management** - Create and manage campus events
- **Responsive Design** - Works seamlessly across devices
- **Database Integration** - MongoDB for persistent data storage

## Getting Started

### Prerequisites

- Node.js v22.x or higher
- MongoDB instance (local or cloud)

### Installation

1. Navigate to the server directory:

   ```bash
   cd server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the server directory with:
   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   ```

### Running the Application

**Development mode:**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure Details

- **Frontend** serves static files and provides the user interface
- **Backend** handles API routes, database operations, and business logic
- **Models** define the schema for Users and Events in MongoDB
