import React from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import Signup from "./components/Signup";
import TaskCreation from "./components/TaskCreation";

const App: React.FC = () => {
  return (
    <Router>
      <div>
        <h1>Task Tracker</h1>
        <Routes>
          <Route path="/" element={<Signup />} />
          <Route path="/task-creation" element={<TaskCreation uid={""} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
