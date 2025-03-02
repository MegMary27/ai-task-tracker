import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { getTranscriptionFromVoice } from "../utils/voiceToText";
import { extractTaskDetails } from "../utils/llmExtraction";

const TaskCreation: React.FC<{ uid: string }> = ({ uid }) => {
  const [task_type, setTaskType] = useState("casual");
  const [taskData, setTaskData] = useState({
    task_name: "",
    task_deadline: "",
    estimated_duration: "",
    task_description: "",
    difficulty_level: "",
    priority_level: "",
  });

  const handleVoiceInput = async (audioBlob: Blob) => {
    const text = await getTranscriptionFromVoice(audioBlob);
    const extractedData = await extractTaskDetails(text);
    
    if (extractedData) {
      setTaskData({
        task_name: extractedData.task_name || "",
        task_deadline: extractedData.task_deadline || "",
        estimated_duration: extractedData.estimated_duration || "",
        task_description: extractedData.task_description || "",
        difficulty_level: extractedData.difficulty_level || "",
        priority_level: extractedData.priority_level || "",
      });
    }
  };

  const saveTask = async () => {
    await setDoc(doc(db, "tasks", `${uid}-${Date.now()}`), {

      ...taskData,
      task_type,
      uid,
    });
    alert("Task Created Successfully!");
  };

  return (
    <div>
      <h2>Create a Task</h2>

      <label>Task Type:</label>
      <select value={task_type} onChange={(e) => setTaskType(e.target.value)}>
        <option value="casual">Casual</option>
        <option value="official">Official</option>
      </select>

      <input type="text" placeholder="Task Name" onChange={(e) => setTaskData({ ...taskData, task_name: e.target.value })} />
      <input type="date" onChange={(e) => setTaskData({ ...taskData, task_deadline: e.target.value })} />
      <input type="text" placeholder="Estimated Duration" onChange={(e) => setTaskData({ ...taskData, estimated_duration: e.target.value })} />
      <input type="text" placeholder="Task Description" onChange={(e) => setTaskData({ ...taskData, task_description: e.target.value })} />
      <input type="text" placeholder="Difficulty Level" onChange={(e) => setTaskData({ ...taskData, difficulty_level: e.target.value })} />
      <input type="text" placeholder="Priority Level" onChange={(e) => setTaskData({ ...taskData, priority_level: e.target.value })} />

      {/* Voice Input */}
      <button onClick={() => document.getElementById("voiceInput")?.click()}>Record Voice Input</button>
      <input type="file" id="voiceInput" accept="audio/*" onChange={(e) => handleVoiceInput(e.target.files![0])} hidden />

      <button onClick={saveTask}>Save Task</button>
    </div>
  );
};

export default TaskCreation;