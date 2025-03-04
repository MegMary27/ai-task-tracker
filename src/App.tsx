import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Auth from "./components/Auth";
import TaskCreationAndDashboard from "./components/TaskCreation";
import UserDashboard from "./components/UserDashboard";
import TaskScheduling from "./components/TaskScheduling";
import { Calendar, List, Clock, User } from "lucide-react";
import './app.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <header className="bg-white shadow-lg p-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-3xl font-extrabold text-blue-700 mb-4 md:mb-0">AI Task Tracker</h1>

          {/* Navigation Menu */}
          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap justify-center gap-6">
              <li>
                <Link to="/" className="flex items-center px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">
                  <User  className="mr-2" size={20} />
                  Login
                </Link>
              </li>
              <li>
                <Link to="/task-creation" className="flex items-center px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">
                  <List className="mr-2" size={20} />
                  Tasks
                </Link>
              </li>
              <li>
                <Link to="/task-scheduling" className="flex items-center px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">
                  <Clock className="mr-2" size={20} />
                  Schedule
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-8 px-4">
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<User Dashboard uid={""} />} />
          <Route path="/task-creation" element={<TaskCreationAndDashboard />} />
          <Route path="/task-scheduling" element={<TaskScheduling />} />
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="bg-white p-10 rounded-lg shadow-lg text-center">
                <h2 className="text-3xl font-bold text-red-600 mb-4">404 - Page Not Found</h2>
                <p className="text-gray-700 mb-6">The page you are looking for doesn't exist.</p>
                <Link to="/" className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </main>

      <footer className="bg-white shadow-lg py-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">© 2025 AI Task Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;