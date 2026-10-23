import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import SignUp from "./SignUp";
import Home from "./Home";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    // 1. When the app opens, check whether someone is already logged in
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // 2. Listen for log ins and log outs from now on
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // 3. Stop listening if App ever goes away
    return () => data.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (session) {
    return <Home session={session} />;
  }

  return (
    <div>
      <h1>Shift App</h1>
      {showSignUp ? <SignUp /> : <Login />}
      <button onClick={() => setShowSignUp(!showSignUp)}>
        {showSignUp
          ? "Already have an account? Log in"
          : "New here? Sign up with an invite code"}
      </button>
    </div>
  );
}

export default App;