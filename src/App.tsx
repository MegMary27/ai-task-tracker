import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Auth from "./components/Auth";
import TaskCreationAndDashboard from "./components/TaskCreation";
import UserDashboard from "./components/UserDashboard"; // Import Dashboard

const App: React.FC = () => {
  return (
    <div>
      <h1>Task Tracker</h1>

      {/* ✅ Navigation Menu */}
      <nav>
        <ul>
          <li><Link to="/">Login</Link></li>
        </ul>
      </nav>

      {/* ✅ Define Routes */}
      <Routes>
        <Route path="/" element={<Auth />} /> {/* Login */}
        <Route path="/dashboard" element={<UserDashboard uid={""} />} /> {/* Dashboard */}
        <Route path="/task-creation" element={<TaskCreationAndDashboard uid="test-user" />} /> {/* Task Creation */}
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </div>
  );
};

export default App;