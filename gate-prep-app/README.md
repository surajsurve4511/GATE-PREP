# GATE Prep App (CS & DA)

A full-stack application for GATE Computer Science and Data Science preparation tracking, resource management, and AI tutoring.

## Prerequisites

1.  **Node.js** installed.
2.  **MySQL** installed and running.
3.  **Gemini API Key** (optional, for AI Tutor).

## Setup Instructions

### 1. Database Setup

1.  Open your MySQL client (e.g., DBeaver).
2.  Connect to your local MySQL server (`jdbc:mysql://localhost:3306/`).
3.  Run the script located at `database/schema.sql`. This will create the `gate` database and populate it with initial syllabus data.

### 2. Backend (Server) Setup

1.  Open a terminal and navigate to the server folder:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure environment variables:
    *   Open `.env` file.
    *   If you have a Gemini API Key, add it to `GEMINI_API_KEY`.
    *   Ensure DB credentials match your setup (default is user: root, no password).
4.  Start the server:
    ```bash
    npm run dev
    ```
    The server will run on `http://localhost:5000`.

### 3. Frontend (Client) Setup

1.  Open a new terminal and navigate to the client folder:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the application:
    ```bash
    npm run dev
    ```
4.  Open the link shown (usually `http://localhost:5173`) in your browser.

## Features

*   **Dashboard**: Track your overall progress and study stats.
*   **Syllabus**: Interactive syllabus for GATE CS and GATE DA. Mark topics as completed.
*   **Resources**: Add and manage links to your local files (Books, PYQs) or web links.
*   **AI Tutor**: Chat with an AI assistant for doubt solving.
