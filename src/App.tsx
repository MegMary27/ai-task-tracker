import React from "react";
import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import TaskCreation from "./components/TaskCreation";

const App: React.FC = () => {
  return (
    <div>
      <h1>Task Tracker</h1>
      <Routes>
        <Route path="/" element={<Auth />} /> {/* Default Route: Auth Page */}
        <Route path="/task-creation" element={<TaskCreation uid="test-user" />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </div>
  );
};

export default App;
