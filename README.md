# GATE Prep App (CS & DA)

A full-stack application for GATE Computer Science and Data Science preparation tracking, resource management, and AI tutoring.

## Project Structure

*   `gate-prep-app/`: Contains the main source code for the Client (React) and Server (Node.js).

## Setup Instructions

To run this application, you need to work within the `gate-prep-app` directory.

### Prerequisites

1.  **Node.js** installed.
2.  **MySQL** installed and running.
3.  **Gemini API Key** (optional, for AI Tutor).

### Quick Start

1.  Navigate to the application directory:
    ```bash
    cd gate-prep-app
    ```

2.  Install all dependencies (Client & Server):
    ```bash
    npm run install-all
    ```
    *(Note: If `install-all` script fails, install dependencies manually in `client` and `server` folders)*

3.  **Database Setup**:
    *   Create a MySQL database named `gate`.
    *   Run the schema script located at `gate-prep-app/database/schema.sql`.

4.  **Environment Setup**:
    *   Configure `.env` files in `server` and `client` if necessary (see `gate-prep-app/README.md` for details).

5.  Run the Application:
    ```bash
    npm run dev
    ```
    This will start both the Backend (Port 5000) and Frontend (Port 5173).

## Features

*   **Dashboard**: Track your overall progress and study stats.
*   **Syllabus**: Interactive syllabus for GATE CS and GATE DA.
*   **Resources**: Manage books, PYQs, and web links.
*   **AI Tutor**: Integrated AI assistant for doubt solving.

For more detailed documentation, please refer to [gate-prep-app/README.md](gate-prep-app/README.md).
