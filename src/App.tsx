import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Auth from "./components/Auth";
import TaskCreationAndDashboard from "./components/TaskCreation";
import UserDashboard from "./components/UserDashboard";
import TaskScheduling from "./components/TaskScheduling";
import { Calendar, List, Clock, User } from "lucide-react";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600 mb-4 md:mb-0">Task Tracker</h1>

          {/* Navigation Menu */}
          <nav className="w-full md:w-auto">
            <ul className="flex flex-wrap justify-center gap-4">
              <li>
                <Link to="/" className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                  <User className="mr-2" size={18} />
                  Login
                </Link>
              </li>
              <li>
                <Link to="/task-creation" className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                  <List className="mr-2" size={18} />
                  Tasks
                </Link>
              </li>
              <li>
                <Link to="/task-scheduling" className="flex items-center px-4 py-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Clock className="mr-2" size={18} />
                  Schedule
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="container mx-auto py-6 px-4">
        {/* Define Routes */}
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/dashboard" element={<UserDashboard uid={""} />} />
          <Route path="/task-creation" element={<TaskCreationAndDashboard />} />
          <Route path="/task-scheduling" element={<TaskScheduling />} />
          <Route path="*" element={
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-red-600 mb-2">404 - Page Not Found</h2>
                <p className="text-gray-600">The page you are looking for doesn't exist.</p>
                <Link to="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Go Home
                </Link>
              </div>
            </div>
          } />
        </Routes>
      </main>
    </div>
  );
};

export default App;