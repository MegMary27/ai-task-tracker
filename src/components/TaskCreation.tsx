import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, setDoc, collection, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { getTranscriptionFromVoice } from "../utils/voiceToText";
import { extractTaskDetails } from "../utils/llmExtraction";

interface Task {
  id: string;
  task_name: string;
  task_deadline: string;
  estimated_duration: string;
  task_description: string;
  difficulty_level: string;
  priority_level: string; // Added for sorting by priority
  status: string; // "finished" or "unfinished"
  task_type: string; // "casual" or "official"
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
  const [casualTasks, setCasualTasks] = useState<Task[]>([]);
  const [officialTasks, setOfficialTasks] = useState<Task[]>([]);
  const [sortOption, setSortOption] = useState("priority"); // Default to "priority"

  // Fetch tasks from Firestore for the dashboard
  useEffect(() => {
    if (!uid) return;

    const tasksRef = collection(db, "tasks");

    // Query for casual tasks (status = unfinished)
    const casualQuery = query(tasksRef, where("uid", "==", uid), where("task_type", "==", "casual"), where("status", "==", "unfinished"));
    const officialQuery = query(tasksRef, where("uid", "==", uid), where("task_type", "==", "official"), where("status", "==", "unfinished"));

    const unsubscribeCasual = onSnapshot(casualQuery, (snapshot) => {
      const fetchedCasualTasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setCasualTasks(fetchedCasualTasks);
    });

    const unsubscribeOfficial = onSnapshot(officialQuery, (snapshot) => {
      const fetchedOfficialTasks: Task[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setOfficialTasks(fetchedOfficialTasks);
    });

    return () => {
      unsubscribeCasual();
      unsubscribeOfficial();
    };
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

  const markTaskAsFinished = async (taskId: string) => {
    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, { status: "finished" });
      console.log(`Task ${taskId} marked as finished`);
    } catch (error) {
      console.error("Error marking task as finished:", error);
    }
  };

  // Sort tasks based on the selected option
  const sortTasks = (tasks: Task[]) => {
    if (sortOption === "priority") {
      return [...tasks].sort((a, b) => {
        const priorityOrder: { [key: string]: number } = {
          low: 1,
          medium: 2,
          high: 3,
        };
        return priorityOrder[b.priority_level] - priorityOrder[a.priority_level];
      });
    } else if (sortOption === "deadline") {
      return [...tasks].sort((a, b) => {
        const dateA = new Date(a.task_deadline);
        const dateB = new Date(b.task_deadline);
        return dateA.getTime() - dateB.getTime();
      });
    }
    return tasks;
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

        {/* Sort Dropdown */}
        <label>Sort By:</label>
        <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="priority">Priority</option>
          <option value="deadline">Deadline</option>
        </select>

        {/* Casual Tasks */}
        <section>
          <h3>Casual Tasks</h3>
          {sortTasks(casualTasks).length > 0 ? (
            <ul>
              {sortTasks(casualTasks).map((task) => (
                <li key={task.id}>
                  <strong>{task.task_name}</strong> - {task.task_deadline} <br />
                  <small>{task.task_description}</small>
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => markTaskAsFinished(task.id)}
                    />
                    Mark as Finished
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>No casual tasks 🎉</p>
          )}
        </section>

        {/* Official Tasks */}
        <section>
          <h3>Official Tasks</h3>
          {sortTasks(officialTasks).length > 0 ? (
            <ul>
              {sortTasks(officialTasks).map((task) => (
                <li key={task.id}>
                  <strong>{task.task_name}</strong> - {task.task_deadline} <br />
                  <small>{task.task_description}</small>
                  <label>
                    <input
                      type="checkbox"
                      onChange={() => markTaskAsFinished(task.id)}
                    />
                    Mark as Finished
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p>No official tasks 🎉</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default TaskCreationAndDashboard;
