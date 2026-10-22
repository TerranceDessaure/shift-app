import { useState } from "react";
import { supabase } from "./supabaseClient";

const roleNames = {
  front_of_house: "Front of House",
  back_of_house: "Back of House",
  manager: "Manager",
};

function SignUp() {
  const [code, setCode] = useState("");
  const [role, setRole] = useState(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  // Step 1: check the invite code
  async function handleCheckCode(event) {
    event.preventDefault();

    const { data, error } = await supabase.rpc("check_invite", {
      p_code: code.trim().toUpperCase(),
    });

    if (error) {
      setMessage(`Something went wrong: ${error.message}`);
      return;
    }

    if (data) {
      setRole(data);
      setMessage("");
    } else {
      setMessage("That code is invalid, already used, or expired.");
    }
  }

  // Step 2: create the account
  async function handleSignUp(event) {
    event.preventDefault();

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          invite_code: code.trim().toUpperCase(),
          username: username.trim(),
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });

    if (error) {
      setMessage(`Sign-up failed: ${error.message}`);
      return;
    }

    setMessage("Account created! Welcome to the team.");
  }

  // No valid code yet: show step 1
  if (!role) {
    return (
      <form onSubmit={handleCheckCode}>
        <h2>Join your team</h2>
        <input
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder="Invite code"
        />
        <button type="submit">Continue</button>
        {message && <p>{message}</p>}
      </form>
    );
  }

  // Valid code: show step 2
  return (
    <form onSubmit={handleSignUp}>
      <h2>Create your account</h2>
      <p>You're joining as: {roleNames[role]}</p>

      <input
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        placeholder="Full name"
        required
      />
      <input
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Username (coworkers see this)"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password (at least 6 characters)"
        required
      />
      <input
        type="tel"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        placeholder="Phone number (optional)"
      />

      <button type="submit">Create account</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default SignUp;