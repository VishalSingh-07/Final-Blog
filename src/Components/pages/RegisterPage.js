import React, { useState } from "react";
import "./pages.css";
function RegisterPage() {
  const url = `${process.env.REACT_APP_API_URL}`;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  async function register(ev) {
    ev.preventDefault();
    const response = await fetch(`${url}/register`, {
      method: "POST",
      body: JSON.stringify({ username, password }),
      headers: { "Content-Type": "application/json" },
    });
    if (response.status === 200) {
      alert("Registration SuccessFul");
    } else {
      alert("Registration Failed");
    }
  }
  return (
    <form action="" className="register" onSubmit={register}>
      <h1>Register</h1>
      <input
        type="text"
        placeholder="username"
        value={username}
        onChange={(ev) => setUsername(ev.target.value)}></input>
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(ev) => setPassword(ev.target.value)}></input>
      <button>Register</button>
    </form>
  );
}

export default RegisterPage;
