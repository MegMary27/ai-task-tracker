import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Clock, Calendar, Smile, List, ArrowRight } from "lucide-react";

interface Task {
  id: string;
  task_name: string;
  task_deadline: string;
  estimated_duration: string;
  task_description: string;
  difficulty_level: string;
  priority_level: string;
  status: string;
  task_type: string;
  scheduled?: boolean;
  scheduledTime?: string;
}

const TaskScheduling: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [productivityDuration, setProductivityDuration] = useState<number>(60); // in minutes
  const [schedulingMethod, setSchedulingMethod] = useState<"deadline" | "mood">("deadline");
  const [mood, setMood] = useState<"energetic" | "neutral" | "tired">("neutral");
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);

  // Fetch logged-in user UID
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
      } else {
        setUid(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch unfinished tasks from Firestore
  useEffect(() => {
    if (!uid) return;

    const tasksRef = collection(db, "tasks");
    const q = query(tasksRef, where("uid", "==", uid), where("status", "==", "unfinished"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedTasks = snapshot.docs.map((doc) => ({ 
        id: doc.id, 
        ...doc.data(),
        estimated_duration: doc.data().estimated_duration || "30" // Default to 30 minutes if not specified
      })) as Task[];
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [uid]);

  const generateSchedule = () => {
    setIsScheduling(true);
    
    // Make a copy of tasks to work with
    let tasksToSchedule = [...tasks];
    let remainingTime = productivityDuration;
    let scheduled: Task[] = [];

    if (schedulingMethod === "deadline") {
      // Sort by deadline (earliest first)
      tasksToSchedule.sort((a, b) => 
        new Date(a.task_deadline).getTime() - new Date(b.task_deadline).getTime()
      );
    } else if (schedulingMethod === "mood") {
      // Sort based on mood and difficulty level
      tasksToSchedule = sortTasksByMood(tasksToSchedule, mood);
    }

    // Schedule tasks until we run out of time
    let currentTime = new Date();
    
    for (const task of tasksToSchedule) {
      const duration = parseInt(task.estimated_duration) || 30; // Default to 30 minutes
      
      if (duration <= remainingTime) {
        // Schedule this task
        const scheduledTask = {
          ...task,
          scheduled: true,
          scheduledTime: formatTime(currentTime)
        };
        
        scheduled.push(scheduledTask);
        remainingTime -= duration;
        
        // Update the current time for the next task
        currentTime = new Date(currentTime.getTime() + duration * 60000);
        
        // If we're out of time, break
        if (remainingTime <= 0) break;
      }
    }

    setScheduledTasks(scheduled);
    setIsScheduling(false);
  };

  const sortTasksByMood = (tasks: Task[], currentMood: string): Task[] => {
    // Define difficulty weights based on mood
    const difficultyWeights: {[key: string]: {[key: string]: number}} = {
      energetic: { high: 1, medium: 2, low: 3 }, // When energetic, prefer difficult tasks
      neutral: { medium: 1, high: 2, low: 3 },   // When neutral, prefer medium difficulty
      tired: { low: 1, medium: 2, high: 3 }      // When tired, prefer easy tasks
    };
    
    // Sort tasks based on difficulty weights for the current mood
    return [...tasks].sort((a, b) => {
      const weightA = difficultyWeights[currentMood][a.difficulty_level.toLowerCase()] || 2;
      const weightB = difficultyWeights[currentMood][b.difficulty_level.toLowerCase()] || 2;
      return weightA - weightB;
    });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const saveSchedule = async () => {
    if (!uid || scheduledTasks.length === 0) return;
    
    try {
      // Update each task with its scheduled status and time
      for (const task of scheduledTasks) {
        const taskRef = doc(db, "tasks", task.id);
        await updateDoc(taskRef, { 
          scheduled: true,
          scheduledTime: task.scheduledTime
        });
      }
      
      alert("Schedule saved successfully!");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule. Please try again.");
    }
  };

  if (uid === null) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <p className="text-center text-lg">Please log in to schedule tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center">
            <Calendar className="mr-2" size={24} /> Task Scheduling
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Productivity Duration (minutes)
              </label>
              <div className="flex items-center">
                <Clock className="mr-2 text-gray-500" size={20} />
                <input
                  type="number"
                  min="15"
                  max="480"
                  value={productivityDuration}
                  onChange={(e) => setProductivityDuration(parseInt(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduling Method
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setSchedulingMethod("deadline")}
                  className={`p-3 rounded-md flex items-center justify-center ${
                    schedulingMethod === "deadline" 
                      ? "bg-blue-100 border-2 border-blue-500 text-blue-700" 
                      : "bg-gray-100 border border-gray-300 text-gray-700"
                  }`}
                >
                  <Calendar className="mr-2" size={18} />
                  Deadline-based
                </button>
                <button
                  onClick={() => setSchedulingMethod("mood")}
                  className={`p-3 rounded-md flex items-center justify-center ${
                    schedulingMethod === "mood" 
                      ? "bg-blue-100 border-2 border-blue-500 text-blue-700" 
                      : "bg-gray-100 border border-gray-300 text-gray-700"
                  }`}
                >
                  <Smile className="mr-2" size={18} />
                  Mood-based
                </button>
              </div>
            </div>
            
            {schedulingMethod === "mood" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Mood
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setMood("energetic")}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      mood === "energetic" 
                        ? "bg-green-100 border-2 border-green-500 text-green-700" 
                        : "bg-gray-100 border border-gray-300 text-gray-700"
                    }`}
                  >
                    Energetic
                  </button>
                  <button
                    onClick={() => setMood("neutral")}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      mood === "neutral" 
                        ? "bg-blue-100 border-2 border-blue-500 text-blue-700" 
                        : "bg-gray-100 border border-gray-300 text-gray-700"
                    }`}
                  >
                    Neutral
                  </button>
                  <button
                    onClick={() => setMood("tired")}
                    className={`p-2 rounded-md flex items-center justify-center ${
                      mood === "tired" 
                        ? "bg-orange-100 border-2 border-orange-500 text-orange-700" 
                        : "bg-gray-100 border border-gray-300 text-gray-700"
                    }`}
                  >
                    Tired
                  </button>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <button
                onClick={generateSchedule}
                disabled={isScheduling || tasks.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
              >
                {isScheduling ? (
                  "Generating Schedule..."
                ) : (
                  <>
                    <List className="mr-2" size={18} />
                    Generate Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {scheduledTasks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
              <List className="mr-2" size={20} /> Your Schedule
            </h3>
            
            <div className="space-y-4">
              {scheduledTasks.map((task, index) => (
                <div key={task.id} className="border border-gray-200 rounded-md p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{task.task_name}</p>
                      <p className="text-sm text-gray-600">{task.task_description}</p>
                      <div className="flex items-center mt-2 text-sm">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md mr-2">
                          {task.estimated_duration} min
                        </span>
                        <span className={`px-2 py-1 rounded-md ${
                          task.priority_level.toLowerCase() === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority_level.toLowerCase() === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {task.priority_level}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Start at:</p>
                      <p className="font-medium text-gray-800">{task.scheduledTime}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-2">
                <button
                  onClick={saveSchedule}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                >
                  <ArrowRight className="mr-2" size={18} />
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        )}
        
        {tasks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">No tasks available for scheduling. Please create tasks first.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskScheduling;