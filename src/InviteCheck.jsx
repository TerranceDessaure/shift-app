import { useState } from "react";
import { supabase } from "./supabaseClient";

const roleNames = {
  front_of_house: "Front of House",
  back_of_house: "Back of House",
  manager: "Manager",
};

function InviteCheck() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault(); // stop the browser from reloading the page

    const { data, error } = await supabase.rpc("check_invite", {
      p_code: code.trim().toUpperCase(),
    });

    if (error) {
      setMessage(`Something went wrong: ${error.message}`);
      return;
    }

    if (data) {
      setMessage(`Valid code! You'll join as: ${roleNames[data]}`);
    } else {
      setMessage("That code is invalid, already used, or expired.");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Join your team</h2>
      <input
        value={code}
        onChange={(event) => setCode(event.target.value)}
        placeholder="Enter your invite code"
      />
      <button type="submit">Check code</button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default InviteCheck;