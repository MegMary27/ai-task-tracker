import React, { useState, useEffect } from "react";
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

const TaskSchedule: React.FC<{ uid: string }> = ({ uid }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [productivityHours, setProductivityHours] = useState<number>(0);
  const [planType, setPlanType] = useState<string>("automatic");
  const [schedule, setSchedule] = useState<Task[]>([]);

  useEffect(() => {
    if (!uid) return;

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("uid", "==", uid), where("status", "==", "unfinished"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(fetchedTasks);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [uid]);

  const handlePlanGeneration = () => {
    let remainingTime = productivityHours;
    let plannedTasks: Task[] = [];

    if (planType === "automatic") {
      // Sort tasks by priority and deadline
      const sortedTasks = tasks.sort((a, b) => {
        // Sorting by priority level and deadline
        if (a.priority_level === b.priority_level) {
          return new Date(a.task_deadline).getTime() - new Date(b.task_deadline).getTime();
        }
        return a.priority_level.localeCompare(b.priority_level);
      });

      // Assign tasks to available time slots
      sortedTasks.forEach((task) => {
        const taskDuration = parseInt(task.estimated_duration);
        if (remainingTime >= taskDuration) {
          plannedTasks.push(task);
          remainingTime -= taskDuration;
        }
      });
    }

    // Set the final schedule
    setSchedule(plannedTasks);
  };

  return (
    <div>
      <h3>Productivity Hours</h3>
      <input
        type="number"
        placeholder="Enter your productivity hours"
        value={productivityHours}
        onChange={(e) => setProductivityHours(parseInt(e.target.value))}
      />

      <button onClick={handlePlanGeneration}>Generate Automatic Plan</button>

      <h3>Your Scheduled Tasks</h3>
      <ul>
        {schedule.length > 0 ? (
          schedule.map((task) => (
            <li key={task.id}>
              <strong>{task.task_name}</strong> - {task.task_deadline} <br />
              <small>{task.task_description}</small> <br />
              <small>Estimated Duration: {task.estimated_duration} hours</small>
            </li>
          ))
        ) : (
          <p>No tasks scheduled based on your productivity hours.</p>
        )}
      </ul>
    </div>
  );
};

export default TaskSchedule;
