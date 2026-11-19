import { useState } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { supabase } from "../services/supabase";
import { useNavigate } from "react-router-dom";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated successfully!");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  return (
    <main className="reset-password-page">
      <div className="reset-password-card">

        <div className="reset-password-icon">
          <ShieldCheck size={32} />
        </div>

        <h1>Reset Password</h1>

        <p>
          Create a new password for your TrustCart account.
        </p>

        <form onSubmit={handleUpdatePassword}>

          <div className="password-field">
            <label>New Password</label>

            <div className="password-input">
              <LockKeyhole size={19} />

              <input
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="password-field">
            <label>Confirm Password</label>

            <div className="password-input">
              <LockKeyhole size={19} />

              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />
            </div>
          </div>

          {error && (
            <div className="reset-error">
              {error}
            </div>
          )}

          {message && (
            <div className="reset-success">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="reset-submit-btn"
          >
            Update Password
          </button>

        </form>

      </div>
    </main>
  );
}

export default ResetPassword;