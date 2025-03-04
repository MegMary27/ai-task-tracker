import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

interface Task {
  id: string;
  task_name: string;
  task_deadline: string;
  estimated_duration: string;
  task_description: string;
  difficulty_level: string;
  priority_level: string;
  status: string; // "finished" or "unfinished"
}

const UserDashboard: React.FC<{ uid: string }> = ({ uid }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!uid) return;

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("uid", "==", uid), where("status", "==", "unfinished"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Task[]);
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <div>
      <h2>User Dashboard</h2>
      {tasks.length > 0 ? (
        <ul>{tasks.map((task) => <li key={task.id}>{task.task_name} - {task.task_deadline}</li>)}</ul>
      ) : <p>No unfinished tasks 🎉</p>}
    </div>
  );
};

export default UserDashboard;
