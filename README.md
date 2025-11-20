"## Menara Prefa – Combined README

# Documentation

## Samaa Roumaissa

- 1 Overview Contents
- 2 Project A — AI Attendance System (pointage)
   - 2.1 Features
   - 2.2 Tech Stack & Requirements
   - 2.3 Folder Structure
   - 2.4 Installation & Setup
   - 2.5 How to Use
   - 2.6 Troubleshooting
- 3 Project B — Construction Site Web Application
   - 3.1 Features
   - 3.2 Tech Stack & Requirements
   - 3.3 Folder Structure
   - 3.4 Installation & Setup
   - 3.5 Troubleshooting
- 4 Development Tips
   - 4.1 Example Environmental Variables
   - 4.2 Build Commands


## 1 Overview Contents

This document presents the combined documentation of the two main applications de-
veloped during my internship at Menara Prefa:

- AI Attendance System (Facial Recognition + Flask + Tkinter)
- Construction Site Web Application (React + Vite + TailwindCSS +
    Flask Backend)
The goal is to provide a clear, structured, and technical reference similar to a GitHub
README.


## 2 Project A — AI Attendance System (pointage)

### 2.1 Features

- Real-time face detection & recognition using OpenCV + facerecognition library.
- Tkinter graphical interface for user registration and attendance.
- Flask backend (face.py) managing processing and database communication.
- All facial encodings and user/attendance records stored in a central database.
- Lightweight, fast, and suitable for on-site attendance verification.

### 2.2 Tech Stack & Requirements

- Python 3.10.11 (required for compatibility with the backend)
- Flask
- OpenCV (opencv-python)
- facerecognition
- numpy, pillow
- SQLAlchemy (psycopg2-binary)
- Tkinter (for GUI)

### 2.3 Folder Structure

pointage/
face.py # Flask backend (Python 3.10.11)
front.py # Tkinter GUI

### 2.4 Installation & Setup

1. Create virtual environment
python3.10 -m venv .venv
source .venv/bin/activate # Linux / macOS
# OR
.\.venv\Scripts\Activate.ps1 # Windows
2. Install dependencies
with pip install
3. Run the backend
python face.py


4. Run the Tkinter GUI
python front.py

### 2.5 How to Use

Register a New User

- Open the Tkinter GUI.
- Enter user information.
- Capture the face image.
- The backend calculates the face encoding and stores it in the database.

Take Attendance

- Launch GUI and start camera.
- The system detects and recognizes faces live.
- Attendance is automatically stored in the database.

### 2.6 Troubleshooting

- Ensure Python 3.10.11 is used to avoid dlib compatibility issues.
- If the camera fails, verify that no other program is using it.
- Confirm that database connection parameters are correct.


## 3 Project B — Construction Site Web Application

### 3.1 Features

- Dashboard for administrators and supervisors.
- Worker management, tasks, alerts, HR modules, and reports.
- Modern frontend using Vite, ReactJS, and TailwindCSS.
- RESTful backend using Flask (Python 3.13.7).
- Communication with PostgreSQL database.

### 3.2 Tech Stack & Requirements

- Frontend
    - React + Vite
    - TailwindCSS
    - Node.js 18+
- Backend
    - Flask (Python 3.13.7)
    - SQLAlchemy
    - PostgreSQL

### 3.3 Folder Structure

Frontend:

frontend/
src/
assets/
images/
pages/
App.jsx
main.jsx
package.json
vite.config.js
tailwind.config.js
Backend:

backend/
__pycache__/ # Compiled Python cache
routes/ # Route definitions (endpoints)
test/ # Test files
app.py # Main Flask application entrypoint
config.py # Configuration (DB URL, secrets, settings)
database.py # Database connection


### 3.4 Installation & Setup

1. Install frontend dependencies
cd frontend
npm install
npm run dev
2. Setup backend
cd backend
python3.13 -m venv .venv
source .venv/bin/activate
pip install (all the requirement)

flask run --host=0.0.0.0 --port=

### 3.5 Troubleshooting

- Ensure Node.js version is correct for Vite.
- Enable CORS in Flask if frontend cannot reach backend.
- Verify database URL in environment variables.

## 4 Development Tips

### 4.1 Example Environmental Variables

FLASK_APP=app.py
DATABASE_URL=postgresql://user:pass@localhost:5432/db
SECRET_KEY=your_secret

### 4.2 Build Commands

Frontend:
npm run build
npm run preview
Backend:
python app.py


" 
