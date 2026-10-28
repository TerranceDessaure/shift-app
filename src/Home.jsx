import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { roleNames } from "./roles";
import ManagerSchedule from "./ManagerSchedule";
import InviteCodes from "./InviteCodes";

function Home({ session }) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  // Load this person's profile when the screen appears
  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, username, role, restaurant_id")
        .eq("id", session.user.id)
        .single();

      if (error) {
        setMessage(`Couldn't load your profile: ${error.message}`);
        return;
      }
      setProfile(data);
    }

    loadProfile();
  }, [session]);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <div>
      <button onClick={handleLogout}>Log out</button>

      {message && <p>{message}</p>}
      {!profile && !message && <p>Loading your profile...</p>}

      {profile && (
        <>
          <h1>Welcome, {profile.full_name}!</h1>
          <p>
            @{profile.username} · {roleNames[profile.role]}
          </p>
          {profile.role === "manager" ? (
            <>
              <ManagerSchedule profile={profile} />
              <InviteCodes />
            </>
          ) : (
            <p>Your schedule will appear here.</p>
          )}
        </>
      )}
    </div>
  );
}

export default Home;