# GATE Prep App - Setup Guide

This guide will help you set up the GATE Prep application on any Windows laptop.

## 1. Prerequisites (Requirements)
Before running the setup, ensure you have the following installed:

1.  **Node.js (LTS Version)**
    *   Download and install from: [https://nodejs.org/](https://nodejs.org/)
    *   Verify by opening a terminal and typing: `node -v`

2.  **MySQL Server**
    *   Download and install MySQL Community Server.
    *   During installation, remember the **root password** you set.
    *   Create a database named `gate` (or whatever you prefer).
    *   *Command to create database:* 
        ```sql
        CREATE DATABASE gate;
        ```

## 2. Automatic Setup (Recommended)
1.  **Run Setup Script**:
    *   Double-click the `setup.bat` file.
    *   It will:
        *   Check for Node.js.
        *   Ask for your MySQL Root Password.
        *   **Install all dependencies** (may take a few minutes).
        *   Create the configuration file (`.env`).
        *   **Automatically create the database**.
        *   **Create a "GATE Nexus" shortcut** with an icon.
2.  Wait for the "SETUP COMPLETE" message.

## 3. Launching the App
*   Double-click the **GATE Nexus** shortcut (Blue Book Icon).
*   It will open the app in a clean window.

## 4. Manual Setup (If script fails)
If you prefer to do it manually, open a terminal in this folder and run:

```bash
# 1. Install Root Dependencies
npm install

# 2. Install Client & Server Dependencies
npm run install-all

# 3. Configure Database
# Go to server folder and create a file named ".env" with the following content:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=gate
```

## 4. Running the Application (The Easy Way)
We have created a simple launcher for you.

1.  **Double-click `Launch_App.bat`**.
2.  It will:
    *   Start the server in the background (minimized).
    *   Open the app in a clean, full-screen window (using Microsoft Edge).
3.  **To Stop**: Close the minimized window named "GATE Nexus Engine".

## 5. Running Manually (Alternative)
