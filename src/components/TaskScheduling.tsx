import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Clock, Calendar, Smile, List, ArrowRight, Brain, Activity, BatteryMedium, Coffee } from "lucide-react";
import { generateAISchedule } from "../utils/aiScheduler";

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

interface UserData {
  age?: string;
  gender?: string;
  occupation?: string;
  dislikes?: string[];
  hobbies?: string[];
  peek_hour_productivity?: string[];
  preferred_task_type?: string[];
  sleep_routine?: string;
  strengths?: string[];
  stress_handling?: string;
  task_prioritization_style?: string;
  workstyle?: string;
}

interface MoodAssessment {
  exhaustion: number;
  motivation: number;
  focus: number;
  stress: number;
  currentFeeling: string;
}

const TaskScheduling: React.FC = () => {
  const [uid, setUid] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userData, setUserData] = useState<UserData>({});
  const [productivityDuration, setProductivityDuration] = useState<number>(60); // in minutes
  const [schedulingMethod, setSchedulingMethod] = useState<"deadline" | "mood">("deadline");
  const [scheduledTasks, setScheduledTasks] = useState<Task[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isAssessingMood, setIsAssessingMood] = useState(false);
  
  // Mood assessment state
  const [moodAssessment, setMoodAssessment] = useState<MoodAssessment>({
    exhaustion: 5,
    motivation: 5,
    focus: 5,
    stress: 5,
    currentFeeling: ""
  });

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

  // Fetch user data from Firestore
  useEffect(() => {
    if (!uid) return;

    const fetchUserData = async () => {
      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [uid]);

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

  const startMoodAssessment = () => {
    setIsAssessingMood(true);
  };

  const handleMoodAssessmentChange = (field: keyof MoodAssessment, value: any) => {
    setMoodAssessment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateSchedule = async () => {
    setIsScheduling(true);
    
    try {
      if (schedulingMethod === "deadline") {
        // Sort by deadline (earliest first)
        const deadlineSchedule = generateDeadlineBasedSchedule();
        setScheduledTasks(deadlineSchedule);
      } else if (schedulingMethod === "mood") {
        // Use AI to generate a personalized schedule based on mood assessment
        const aiSchedule = await generateAISchedule({
          tasks,
          userData,
          moodAssessment,
          productivityDuration
        });
        
        setScheduledTasks(aiSchedule);
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      alert("Failed to generate schedule. Please try again.");
    } finally {
      setIsScheduling(false);
      setIsAssessingMood(false);
    }
  };

  const generateDeadlineBasedSchedule = () => {
    // Make a copy of tasks to work with
    let tasksToSchedule = [...tasks];
    let remainingTime = productivityDuration;
    let scheduled: Task[] = [];

    // Sort by deadline (earliest first)
    tasksToSchedule.sort((a, b) => 
      new Date(a.task_deadline).getTime() - new Date(b.task_deadline).getTime()
    );

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

    return scheduled;
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

  const renderMoodAssessment = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center">
          <Brain className="mr-2" size={20} /> Mood Assessment
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <BatteryMedium className="mr-2" size={18} />
              How exhausted are you? (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodAssessment.exhaustion}
              onChange={(e) => handleMoodAssessmentChange('exhaustion', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not at all (1)</span>
              <span>Very exhausted (10)</span>
            </div>
            <p className="text-center mt-1 font-medium">
              {moodAssessment.exhaustion}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Activity className="mr-2" size={18} />
              How motivated are you feeling? (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodAssessment.motivation}
              onChange={(e) => handleMoodAssessmentChange('motivation', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not motivated (1)</span>
              <span>Highly motivated (10)</span>
            </div>
            <p className="text-center mt-1 font-medium">
              {moodAssessment.motivation}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Coffee className="mr-2" size={18} />
              How focused do you feel right now? (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodAssessment.focus}
              onChange={(e) => handleMoodAssessmentChange('focus', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Unfocused (1)</span>
              <span>Highly focused (10)</span>
            </div>
            <p className="text-center mt-1 font-medium">
              {moodAssessment.focus}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Activity className="mr-2" size={18} />
              How stressed are you feeling? (1-10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={moodAssessment.stress}
              onChange={(e) => handleMoodAssessmentChange('stress', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Not stressed (1)</span>
              <span>Very stressed (10)</span>
            </div>
            <p className="text-center mt-1 font-medium">
              {moodAssessment.stress}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Smile className="mr-2" size={18} />
              How would you describe your current feeling?
            </label>
            <textarea
              value={moodAssessment.currentFeeling}
              onChange={(e) => handleMoodAssessmentChange('currentFeeling', e.target.value)}
              placeholder="E.g., I'm feeling a bit tired but ready to tackle some work..."
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
          
          <div className="pt-2">
            <button
              onClick={generateSchedule}
              disabled={isScheduling}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              {isScheduling ? (
                "Generating Personalized Schedule..."
              ) : (
                <>
                  <Brain className="mr-2" size={18} />
                  Generate Personalized Schedule
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
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
        {!isAssessingMood && (
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
                    <Brain className="mr-2" size={18} />
                    AI Personalized
                  </button>
                </div>
              </div>
              
              <div className="pt-2">
                {schedulingMethod === "deadline" ? (
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
                ) : (
                  <button
                    onClick={startMoodAssessment}
                    disabled={tasks.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 flex items-center justify-center"
                  >
                    <Brain className="mr-2" size={18} />
                    Start Mood Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {isAssessingMood && renderMoodAssessment()}
        
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