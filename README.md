# AI Task Tracker with Voice Integration

The AI Task Tracker project helps users manage and prioritize their tasks based on AI-driven task tracking, voice input, and task scheduling. This project includes both a backend (Python with virtual environment) and a frontend (React with Vite).

### Project Structure
```ai-task-tracker/ │ ├── backend/ # Python backend with virtual environment │ ├── venv/ # Virtual environment for backend dependencies │ ├── requirements.txt # Backend dependencies │ ├── app.py # Backend main file │ └── ... # Other backend files │ ├── frontend/ # React frontend with Vite │ ├── node_modules/ # Node.js modules │ ├── public/ # Public files (index.html, assets, etc.) │ ├── src/ # Source files (components, hooks, etc.) │ ├── package.json # Frontend dependencies │ ├── vite.config.ts # Vite configuration file │ └── ... # Other frontend files │ └── README.md```


---

### Prerequisites

Before running the project, make sure you have the following installed:

- **Python 3.x** and **pip** (for backend)
- **Node.js** and **npm** or **yarn** (for frontend)
- **Git** (to clone the repo)

---

### Backend Setup (Python)

1. **Navigate to the `backend/` folder:**
   ```bash
   cd backend
Create a virtual environment:

On Windows:
python -m venv venv

On macOS/Linux:
python3 -m venv venv

## Activate the virtual environment:

On Windows:
.\venv\Scripts\activate

On macOS/Linux:
source venv/bin/activate

## Install the required dependencies:

Run the following command in the backend directory:
pip install -r requirements.txt

This will install all the necessary Python libraries required by the backend.

## Run the backend server:
After installing the dependencies, you can run the backend server:
python app.py

The backend should now be running on a local server (e.g., http://localhost:5000).

### Frontend Setup (React with Vite)

Install frontend dependencies:

Using npm:
npm install

Or using yarn:
yarn install

## Start the frontend development server:

Run the following command:
npm run dev

Or if using yarn:
yarn dev

This will start the frontend on http://localhost:3000 by default.

### Environment Configuration
For the backend, you may need to configure environment variables (e.g., for database connection, API keys, etc.). You can create a .env file inside the backend/ directory and add your variables there.

Example .env file:
DATABASE_URL=your-database-url
API_KEY=your-api-key

Make sure to replace your-database-url and your-api-key with your actual credentials.

### Running Both Backend and Frontend
Start the backend server (follow steps from the Backend Setup).
Start the frontend development server (follow steps from the Frontend Setup).
The frontend should now be able to interact with the backend, and you can test the application on your browser.

Deployment
To deploy the backend and frontend:

### Backend:

Deploy the backend using services like Heroku, AWS, or DigitalOcean.
Make sure to update the .env file with production values.
Frontend:

### Build the frontend for production:

npm run build

Deploy the dist folder to hosting services like Vercel, Netlify, or any other static site hosting services.
Troubleshooting

If you run into issues with dependencies, ensure you're using the correct versions of Python, Node.js, and the corresponding package managers (pip/npm).
If the frontend cannot connect to the backend, make sure the backend is running and accessible from the frontend.

### License
This project is licensed under the MIT License - see the LICENSE file for details.


