import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { roleNames } from "./roles";

// Describe a code's status for the list
function codeStatus(invite) {
  if (invite.used_by) {
    return `Used by ${invite.used_by_profile?.full_name ?? "someone"}`;
  }
  if (new Date(invite.expires_at) < new Date()) {
    return "Expired";
  }
  const expires = new Date(invite.expires_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `Active, expires ${expires}`;
}

function InviteCodes() {
  const [codes, setCodes] = useState([]);
  const [role, setRole] = useState("front_of_house");
  const [newCode, setNewCode] = useState("");
  const [message, setMessage] = useState("");

  async function loadCodes() {
    const { data, error } = await supabase
      .from("invite_codes")
      .select(
        "code, role, used_by, expires_at, used_by_profile:profiles!invite_codes_used_by_fkey(full_name)"
      )
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      setMessage(`Couldn't load invite codes: ${error.message}`);
      return;
    }
    setCodes(data);
  }

  useEffect(() => {
    loadCodes();
  }, []);

  async function handleCreate() {
    setMessage("");

    const { data, error } = await supabase.rpc("create_invite", { p_role: role });

    if (error) {
      setMessage(`Couldn't create code: ${error.message}`);
      return;
    }

    setNewCode(data);
    loadCodes();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(newCode);
    setMessage("Code copied!");
  }

  async function handleRevoke(invite) {
    if (!window.confirm(`Revoke code ${invite.code}? It will stop working.`)) {
      return;
    }

    const { error } = await supabase.from("invite_codes").delete().eq("code", invite.code);

    if (error) {
      setMessage(`Couldn't revoke code: ${error.message}`);
      return;
    }

    if (invite.code === newCode) {
      setNewCode("");
    }
    setMessage(`Code ${invite.code} revoked.`);
    loadCodes();
  }

  return (
    <section>
      <h2>Invite codes</h2>
      <p>Create a code and send it to your new hire. Codes expire after 7 days.</p>

      <select value={role} onChange={(event) => setRole(event.target.value)}>
        <option value="front_of_house">Front of House</option>
        <option value="back_of_house">Back of House</option>
        <option value="manager">Manager</option>
      </select>
      <button type="button" onClick={handleCreate}>
        Create code
      </button>

      {newCode && (
        <p>
          New code: <strong>{newCode}</strong>{" "}
          <button type="button" onClick={handleCopy}>
            Copy
          </button>
        </p>
      )}

      {message && <p>{message}</p>}

      <h3>Recent codes</h3>
      {codes.length === 0 && <p>No codes yet.</p>}
      <ul>
        {codes.map((invite) => (
          <li key={invite.code}>
            {invite.code} ({roleNames[invite.role]}): {codeStatus(invite)}{" "}
            {!invite.used_by && (
              <button type="button" onClick={() => handleRevoke(invite)}>
                Revoke
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default InviteCodes;