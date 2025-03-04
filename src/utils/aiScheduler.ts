import { GoogleGenerativeAI } from "@google/generative-ai";
const GEMINI_API_KEY = "AIzaSyDl6IZpJVfhwShWB7kU8HJyeT-r7RF1yfQ";

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

interface ScheduleInput {
  tasks: Task[];
  userData: UserData;
  moodAssessment: MoodAssessment;
  productivityDuration: number;
}

// Function to generate AI-based schedule
export async function generateAISchedule(input: ScheduleInput): Promise<Task[]> {
  try {
    // If no API key is available, fall back to a local algorithm
    if (!GEMINI_API_KEY) {
      console.warn("No Gemini API key found. Using fallback algorithm.");
      return generateFallbackSchedule(input);
    }

    const { tasks, userData, moodAssessment, productivityDuration } = input;
    
    // Initialize the Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a prompt for the AI
    const prompt = `
      I need to create a personalized task schedule based on the following information:
      
      USER PROFILE:
      Age: ${userData.age || "Unknown"}
      Gender: ${userData.gender || "Unknown"}
      Occupation: ${userData.occupation || "Unknown"}
      Peak productivity hours: ${userData.peek_hour_productivity?.join(", ") || "Unknown"}
      Preferred task types: ${userData.preferred_task_type?.join(", ") || "Unknown"}
      Sleep routine: ${userData.sleep_routine || "Unknown"}
      Work style: ${userData.workstyle || "Unknown"}
      Task prioritization style: ${userData.task_prioritization_style || "Unknown"}
      Stress handling: ${userData.stress_handling || "Unknown"}
      
      CURRENT MOOD ASSESSMENT:
      Exhaustion level (1-10): ${moodAssessment.exhaustion}
      Motivation level (1-10): ${moodAssessment.motivation}
      Focus level (1-10): ${moodAssessment.focus}
      Stress level (1-10): ${moodAssessment.stress}
      Current feeling: ${moodAssessment.currentFeeling || "No description provided"}
      
      AVAILABLE TASKS:
      ${tasks.map(task => `
        - Task: ${task.task_name}
        - Description: ${task.task_description}
        - Deadline: ${task.task_deadline}
        - Estimated Duration: ${task.estimated_duration} minutes
        - Difficulty Level: ${task.difficulty_level}
        - Priority Level: ${task.priority_level}
        - Type: ${task.task_type}
      `).join("\n")}
      
      CONSTRAINTS:
      - Total productivity duration available: ${productivityDuration} minutes
      - Need to create a schedule that fits within this time limit
      - Start time is the current time according to Indian Standard Time  
      
      Based on all this information, create an optimal schedule that:
      1. Takes into account the user's current mood and energy levels
      2. Prioritizes tasks appropriately based on deadlines, difficulty, and the user's current state
      3. Considers the user's preferences and work style
      4. Maximizes productivity within the given time constraint
      5. Add Breaks or timeframes for rest in the schedule to optimise productivity
      
      Return the schedule as a JSON array with the following structure for each task:
      [
        {
          "id": "task-id",
          "task_name": "Task Name",
          "task_deadline": "YYYY-MM-DD",
          "estimated_duration": "duration in minutes",
          "task_description": "description",
          "difficulty_level": "low/medium/high",
          "priority_level": "low/medium/high",
          "status": "unfinished",
          "task_type": "casual/official",
          "scheduled": true,
          "scheduledTime": "HH:MM AM/PM"
        },
        ...
      ]
      
      Only include tasks that fit within the ${productivityDuration} minute time limit.
    `;

    // Generate response from AI
    const result = await model.generateContent(prompt);
    
    const response = await result.response;
    const text = response.text();
    console.log(text);
    
    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("Failed to extract JSON from AI response");
      return generateFallbackSchedule(input);
    }
    
    const scheduledTasks = JSON.parse(jsonMatch[0]) as Task[];
    
    // Ensure all tasks have the required properties
    return scheduledTasks.map(task => ({
      ...task,
      scheduled: true,
      scheduledTime: task.scheduledTime || formatTime(new Date())
    }));
  } catch (error) {
    console.error("Error generating AI schedule:", error);
    return generateFallbackSchedule(input);
  }
};

// Fallback algorithm if AI generation fails
const generateFallbackSchedule = (input: ScheduleInput): Task[] => {
  const { tasks, moodAssessment, productivityDuration } = input;
  let remainingTime = productivityDuration;
  let scheduled: Task[] = [];
  let currentTime = new Date();
  console.log("backup working not AI");
  
  // Create a copy of tasks to work with
  let tasksToSchedule = [...tasks];
  
  // Determine the user's energy level based on mood assessment
  const energyLevel = calculateEnergyLevel(moodAssessment);
  
  // Sort tasks based on the user's current energy level and mood
  tasksToSchedule = sortTasksByMood(tasksToSchedule, energyLevel, moodAssessment);
  
  // Schedule tasks until we run out of time
  for (const task of tasksToSchedule) {
    const duration = parseInt(task.estimated_duration) || 30;
    
    if (duration <= remainingTime) {
      const scheduledTask = {
        ...task,
        scheduled: true,
        scheduledTime: formatTime(currentTime)
      };
      
      scheduled.push(scheduledTask);
      remainingTime -= duration;
      
      // Update the current time for the next task
      currentTime = new Date(currentTime.getTime() + duration * 60000);
      
      if (remainingTime <= 0) break;
    }
  }
  
  return scheduled;
};

// Helper function to calculate energy level from mood assessment
const calculateEnergyLevel = (moodAssessment: MoodAssessment): "high" | "medium" | "low" => {
  const { exhaustion, motivation, focus } = moodAssessment;
  
  // Calculate an overall energy score
  const energyScore = (10 - exhaustion) * 0.4 + motivation * 0.4 + focus * 0.2;
  
  if (energyScore >= 7) return "high";
  if (energyScore >= 4) return "medium";
  return "low";
};

// Sort tasks based on energy level and mood
const sortTasksByMood = (
  tasks: Task[], 
  energyLevel: "high" | "medium" | "low",
  moodAssessment: MoodAssessment
): Task[] => {
  // Define weights for different factors
  const weights = {
    deadline: 0.3,
    priority: 0.3,
    difficulty: 0.2,
    duration: 0.2
  };
  
  // Adjust weights based on energy level
  if (energyLevel === "high") {
    weights.difficulty = 0.4;
    weights.priority = 0.3;
    weights.deadline = 0.2;
    weights.duration = 0.1;
  } else if (energyLevel === "low") {
    weights.difficulty = 0.1;
    weights.duration = 0.3;
    weights.priority = 0.3;
    weights.deadline = 0.3;
  }
  
  // If stress is high, prioritize quick wins
  if (moodAssessment.stress > 7) {
    weights.duration = 0.4;
    weights.difficulty = 0.1;
  }
  
  // Calculate a score for each task
  const scoredTasks = tasks.map(task => {
    // Convert deadline to days from now
    const deadlineDays = Math.max(
      1, 
      Math.ceil((new Date(task.task_deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    
    // Convert priority to numeric value
    const priorityValue = 
      task.priority_level.toLowerCase() === "high" ? 3 :
      task.priority_level.toLowerCase() === "medium" ? 2 : 1;
    
    // Convert difficulty to numeric value (reversed for low energy)
    let difficultyValue = 
      task.difficulty_level.toLowerCase() === "high" ? 3 :
      task.difficulty_level.toLowerCase() === "medium" ? 2 : 1;
    
    // If energy is low, reverse difficulty values
    if (energyLevel === "low") {
      difficultyValue = 4 - difficultyValue;
    }
    
    // Duration score (shorter tasks get higher scores when energy is low)
    const durationValue = energyLevel === "low" 
      ? 100 / (parseInt(task.estimated_duration) || 30)
      : 30 / (parseInt(task.estimated_duration) || 30);
    
    // Calculate final score
    const score = 
      (1 / deadlineDays) * weights.deadline +
      priorityValue * weights.priority +
      difficultyValue * weights.difficulty +
      durationValue * weights.duration;
    
    return { task, score };
  });
  
  // Sort by score (descending)
  scoredTasks.sort((a, b) => b.score - a.score);
  
  // Return sorted tasks
  return scoredTasks.map(item => item.task);
};

// Format time helper
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};