import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { roleNames } from "./roles";
import ManagerSchedule from "./ManagerSchedule";
import InviteCodes from "./InviteCodes";
import MySchedule from "./MySchedule";
import { APP_NAME } from "./config";

function Home({ session }) {
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");
  const [tab, setTab] = useState("mine");

  // Load this person's profile when the screen appears
  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, username, role, restaurant_id")
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
  <>
    <header className="header">
      <strong>{APP_NAME}</strong>
      <button className="secondary small" onClick={handleLogout}>
        Log out
      </button>
    </header>

    <main className="container">
      {message && <p className="message">{message}</p>}
      {!profile && !message && <p className="muted">Loading your profile...</p>}

      {profile && (
        <>
          <h1>Welcome, {profile.full_name}!</h1>
          <p className="muted">
            @{profile.username} · {roleNames[profile.role]}
          </p>

          {profile.role === "manager" && (
            <nav className="tabs">
              <button
                className={tab === "mine" ? "tab active" : "tab"}
                onClick={() => setTab("mine")}
              >
                My schedule
              </button>
              <button
                className={tab === "team" ? "tab active" : "tab"}
                onClick={() => setTab("team")}
              >
                Team schedule
              </button>
              <button
                className={tab === "invites" ? "tab active" : "tab"}
                onClick={() => setTab("invites")}
              >
                Invite codes
              </button>
            </nav>
          )}

          {tab === "mine" && <MySchedule profile={profile} />}
          {tab === "team" && <ManagerSchedule profile={profile} />}
          {tab === "invites" && <InviteCodes />}
        </>
      )}
    </main>
  </>
);
}

export default Home;