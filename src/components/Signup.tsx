import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface UserData {
  age: string;
  dislikes: string[];
  gender: string;
  hobbies: string[];
  name: string;
  occupation: string;
  peek_hour_productivity: string[];
  preferred_task_type: string[];
  sleep_routine: string;
  strengths: string[];
  stress_handling: string;
  task_prioritization_style: string;
  workstyle: string;
}

const Signup: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState<UserData>({
    age: "",
    dislikes: [],
    gender: "",
    hobbies: [],
    name: "",
    occupation: "",
    peek_hour_productivity: [],
    preferred_task_type: [],
    sleep_routine: "",
    strengths: [],
    stress_handling: "",
    task_prioritization_style: "",
    workstyle: "",
  });

  const navigate = useNavigate(); // Hook for navigation

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

      // Redirect to Task Creation page
      navigate("/task-creation");
    } catch (error) {
      console.error("Signup Error:", error);
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
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
      <button onClick={signUp}>Sign Up</button>
    </div>
  );
};

export default Signup;
