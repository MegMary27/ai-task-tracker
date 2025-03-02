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
    // Modify query to filter by both uid and status as "unfinished"
    const q = query(tasksRef, where("uid", "==", uid), where("status", "==", "unfinished"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      console.log(fetchedTasks);
      setTasks(fetchedTasks);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [uid]);

  return (
    <div>
      <h2>User Dashboard</h2>

      {/* Unfinished Tasks */}
      <section>
        <h3>Tasks to Do</h3>
        {tasks.length > 0 ? (
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <strong>{task.task_name}</strong> - {task.task_deadline} <br />
                <small>{task.task_description}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p>No unfinished tasks 🎉</p>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;
