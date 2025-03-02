import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { getTranscriptionFromVoice } from "../utils/voiceToText";
import { extractTaskDetails } from "../utils/llmExtraction";

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

const TaskCreationAndDashboard: React.FC<{ uid?: string }> = ({ uid = "" }) => {
  const [task_type, setTaskType] = useState("casual");
  const [taskData, setTaskData] = useState({
    task_name: "",
    task_deadline: "",
    estimated_duration: "",
    task_description: "",
    difficulty_level: "",
    priority_level: "",
    status: "",
  });
  const [tasks, setTasks] = useState<Task[]>([]);

  // Fetch tasks from Firestore for the dashboard
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

  const handleVoiceInput = async (audioBlob: Blob) => {
    try {
      const text = await getTranscriptionFromVoice(audioBlob);
      console.log("Transcribed Text:", text);

      const extractedData = await extractTaskDetails(text);
      console.log("Extracted Task Data:", extractedData);

      if (extractedData) {
        setTaskData(extractedData);
        await saveTask(extractedData); // Save immediately after voice input
      }
    } catch (error) {
      console.error("Error in handleVoiceInput:", error);
    }
  };

  const saveTask = async (taskToSave = taskData) => {
    try {
      await setDoc(doc(db, "tasks", `${uid}-${Date.now()}`), {
        ...taskToSave,
        task_type,
        status: "unfinished",
        uid,
      });
      alert("Task Created Successfully!");
    } catch (error) {
      console.error("Error saving task to Firestore:", error);
    }
  };

  return (
    <div>
      <div>
        <h2>Create a Task</h2>
        <label>Task Type:</label>
        <select value={task_type} onChange={(e) => setTaskType(e.target.value)}>
          <option value="casual">Casual</option>
          <option value="official">Official</option>
        </select>

        <input
          type="text"
          placeholder="Task Name"
          value={taskData.task_name}
          onChange={(e) => setTaskData({ ...taskData, task_name: e.target.value })}
        />
        <input
          type="date"
          value={taskData.task_deadline}
          onChange={(e) => setTaskData({ ...taskData, task_deadline: e.target.value })}
        />
        <input
          type="text"
          placeholder="Estimated Duration"
          value={taskData.estimated_duration}
          onChange={(e) => setTaskData({ ...taskData, estimated_duration: e.target.value })}
        />
        <input
          type="text"
          placeholder="Task Description"
          value={taskData.task_description}
          onChange={(e) => setTaskData({ ...taskData, task_description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Difficulty Level"
          value={taskData.difficulty_level}
          onChange={(e) => setTaskData({ ...taskData, difficulty_level: e.target.value })}
        />
        <input
          type="text"
          placeholder="Priority Level"
          value={taskData.priority_level}
          onChange={(e) => setTaskData({ ...taskData, priority_level: e.target.value })}
        />

        <button onClick={() => document.getElementById("voiceInput")?.click()}>
          Record Voice Input
        </button>
        <input
          type="file"
          id="voiceInput"
          accept="audio/*"
          onChange={(e) => handleVoiceInput(e.target.files![0])}
          hidden
        />

        <button onClick={() => saveTask()}>Save Task</button>
      </div>

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
    </div>
  );
};

export default TaskCreationAndDashboard;
