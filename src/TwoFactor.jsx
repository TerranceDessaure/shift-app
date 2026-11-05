import { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";

function TwoFactor() {
  const [factorId, setFactorId] = useState(null);
  const [qrCode, setQrCode] = useState(""); // only set during first-time setup
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const started = useRef(false);

  useEffect(() => {
    // React runs effects twice in development; only start setup once
    if (started.current) return;
    started.current = true;

    async function start() {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        setMessage(`Something went wrong: ${error.message}`);
        return;
      }

      // Already set up: just ask for the code
      if (data.totp.length > 0) {
        setFactorId(data.totp[0].id);
        return;
      }

      // Remove any setup that was started but never finished
      for (const factor of data.all) {
        if (factor.status === "unverified") {
          await supabase.auth.mfa.unenroll({ factorId: factor.id });
        }
      }

      // Start a new setup
      const { data: setup, error: setupError } = await supabase.auth.mfa.enroll({
        factorType: "totp",
      });
      if (setupError) {
        setMessage(`Couldn't start setup: ${setupError.message}`);
        return;
      }
      setFactorId(setup.id);
      setQrCode(setup.totp.qr_code);
      setSecret(setup.totp.secret);
    }

    start();
  }, []);

  async function handleVerify(event) {
    event.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: code.trim(),
    });

    if (error) {
      setMessage(`That code didn't work: ${error.message}`);
      setCode("");
    }
    // On success, App notices the upgraded login and shows the Home screen
  }

  return (
    <div className="container">
      <div className="card">
        <form onSubmit={handleVerify}>
          <h2>{qrCode ? "Set up two-factor login" : "Enter your code"}</h2>

          {qrCode ? (
            <>
              <p>
                Scan this QR code with an authenticator app (like Google Authenticator), then
                enter the 6-digit code it shows.
              </p>
              <img src={qrCode} alt="QR code for your authenticator app" width="200" height="200" />
              <p className="muted">
                Can't scan it? Enter this key in the app instead: <strong>{secret}</strong>
              </p>
            </>
          ) : (
            <p>Open your authenticator app and enter the 6-digit code.</p>
          )}

          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="6-digit code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            required
          />
          <button type="submit" disabled={!factorId}>
            Verify
          </button>
          {message && <p className="message">{message}</p>}
        </form>
      </div>

      <button className="secondary" onClick={() => supabase.auth.signOut()}>
        Log out
      </button>
    </div>
  );
}

export default TwoFactor;