import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface UserData {
  name: string;
  age: string;
  gender: string;
  occupation: string;
  dislikes: string[];
  hobbies: string[];
  peek_hour_productivity: string[];
  preferred_task_type: string[];
  sleep_routine: string;
  strengths: string[];
  stress_handling: string;
  task_prioritization_style: string;
  workstyle: string;
}

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between sign-in and sign-up
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<UserData>({
    name: "",
    age: "",
    gender: "",
    occupation: "",
    dislikes: [],
    hobbies: [],
    peek_hour_productivity: [],
    preferred_task_type: [],
    sleep_routine: "",
    strengths: [],
    stress_handling: "",
    task_prioritization_style: "",
    workstyle: "",
  });

  const navigate = useNavigate(); // Hook for navigation

  // ✅ Handle Sign Up
  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        ...userData,
      });

      alert("Signup Successful!");
      navigate("/task-creation"); // Redirect to Task Creation page
    } catch (error) {
      console.error("Signup Error:", error);
      alert("Signup Failed. Please try again.");
    }
  };

  // ✅ Handle Sign In
  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful!");
      navigate("/task-creation"); // Redirect to Task Creation page
    } catch (error) {
      console.error("Sign-in Error:", error);
      alert("Invalid email or password.");
    }
  };

  return (
    <div>
      <h2>{isSignUp ? "Sign Up" : "Sign In"}</h2>
      
      <input 
        type="email" 
        placeholder="Email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      
      <input 
        type="password" 
        placeholder="Password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />

      {/* Additional fields for sign-up */}
      {isSignUp && (
        <>
          <input type="text" placeholder="Name" onChange={(e) => setUserData({ ...userData, name: e.target.value })} />
          <input type="text" placeholder="Age" onChange={(e) => setUserData({ ...userData, age: e.target.value })} />
          <input type="text" placeholder="Gender" onChange={(e) => setUserData({ ...userData, gender: e.target.value })} />
          <input type="text" placeholder="Occupation" onChange={(e) => setUserData({ ...userData, occupation: e.target.value })} />
          <input type="text" placeholder="Dislikes (comma separated)" onChange={(e) => setUserData({ ...userData, dislikes: e.target.value.split(",") })} />
          <input type="text" placeholder="Hobbies (comma separated)" onChange={(e) => setUserData({ ...userData, hobbies: e.target.value.split(",") })} />
          <input type="text" placeholder="Peak Hour Productivity (comma separated)" onChange={(e) => setUserData({ ...userData, peek_hour_productivity: e.target.value.split(",") })} />
          <input type="text" placeholder="Preferred Task Type (comma separated)" onChange={(e) => setUserData({ ...userData, preferred_task_type: e.target.value.split(",") })} />
          <input type="text" placeholder="Sleep Routine" onChange={(e) => setUserData({ ...userData, sleep_routine: e.target.value })} />
          <input type="text" placeholder="Strengths (comma separated)" onChange={(e) => setUserData({ ...userData, strengths: e.target.value.split(",") })} />
          <input type="text" placeholder="Stress Handling" onChange={(e) => setUserData({ ...userData, stress_handling: e.target.value })} />
          <input type="text" placeholder="Task Prioritization Style" onChange={(e) => setUserData({ ...userData, task_prioritization_style: e.target.value })} />
          <input type="text" placeholder="Work Style" onChange={(e) => setUserData({ ...userData, workstyle: e.target.value })} />
        </>
      )}

      {/* Sign In & Sign Up Buttons */}
      {isSignUp ? (
        <button onClick={signUp}>Sign Up</button>
      ) : (
        <button onClick={signIn}>Sign In</button>
      )}

      {/* Toggle between Sign In & Sign Up */}
      <p onClick={() => setIsSignUp(!isSignUp)} style={{ cursor: "pointer", color: "blue" }}>
        {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
      </p>
    </div>
  );
};

export default Auth;
