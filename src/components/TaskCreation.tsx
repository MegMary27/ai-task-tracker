import React, { useState } from "react";
import { db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";
import { getTranscriptionFromVoice } from "../utils/voiceToText";
import { extractTaskDetails } from "../utils/llmExtraction";

const TaskCreation: React.FC<{ uid?: string }> = ({ uid = "" }) => {
  const [task_type, setTaskType] = useState("casual");
  const [taskData, setTaskData] = useState({
    task_name: "",
    task_deadline: "",
    estimated_duration: "",
    task_description: "",
    difficulty_level: "",
    priority_level: "",
    status:""
  });

  const handleVoiceInput = async (audioBlob: Blob) => {
    try {
      const text = await getTranscriptionFromVoice(audioBlob);
      console.log("Transcribed Text:", text); // ✅ Debug log for transcription

      const extractedData = await extractTaskDetails(text);
      console.log("Extracted Task Data:", extractedData); // ✅ Debug log for extracted data

      if (extractedData) {
        setTaskData(extractedData); // ✅ Update UI state
        await saveTask(extractedData); // ✅ Save to Firestore immediately
      }
    } catch (error) {
      console.error("Error in handleVoiceInput:", error);
    }
  };

  const saveTask = async (taskToSave = taskData) => {
    console.log("Saving Task Data:", taskToSave); // ✅ Debug log before saving
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
      <h2>Create a Task</h2>

      <label>Task Type:</label>
      <select value={task_type} onChange={(e) => setTaskType(e.target.value)}>
        <option value="casual">Casual</option>
        <option value="official">Official</option>
      </select>

      <input type="text" placeholder="Task Name" value={taskData.task_name} onChange={(e) => setTaskData({ ...taskData, task_name: e.target.value })} />
      <input type="date" value={taskData.task_deadline} onChange={(e) => setTaskData({ ...taskData, task_deadline: e.target.value })} />
      <input type="text" placeholder="Estimated Duration" value={taskData.estimated_duration} onChange={(e) => setTaskData({ ...taskData, estimated_duration: e.target.value })} />
      <input type="text" placeholder="Task Description" value={taskData.task_description} onChange={(e) => setTaskData({ ...taskData, task_description: e.target.value })} />
      <input type="text" placeholder="Difficulty Level" value={taskData.difficulty_level} onChange={(e) => setTaskData({ ...taskData, difficulty_level: e.target.value })} />
      <input type="text" placeholder="Priority Level" value={taskData.priority_level} onChange={(e) => setTaskData({ ...taskData, priority_level: e.target.value })} />
    
      {/* Voice Input */}
      <button onClick={() => document.getElementById("voiceInput")?.click()}>Record Voice Input</button>
      <input type="file" id="voiceInput" accept="audio/*" onChange={(e) => handleVoiceInput(e.target.files![0])} hidden />

      <button onClick={() => saveTask()}>Save Task</button>
    </div>
  );
};

export default TaskCreation;