import React from "react";
import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup";
import TaskCreation from "./components/TaskCreation";

const App: React.FC = () => {
  return (
    <div>
      <h1>Task Tracker</h1>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/task-creation" element={<TaskCreation uid="test-user" />} />
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </div>
  );
};

export default App;
