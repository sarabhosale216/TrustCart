import { useEffect, useState } from "react";
import {
  ShieldCheck,
  User,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [alreadyLoggedIn, setAlreadyLoggedIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        setAlreadyLoggedIn(true);
      }

      setCheckingSession(false);
    };

    checkSession();
  }, []);

  const handleSignup = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    // Supabase can return an existing user without
    // creating a new account.
    if (
      data.user &&
      data.user.identities &&
      data.user.identities.length === 0
    ) {
      setError(
        "This email is already registered. Please sign in instead."
      );
      return;
    }

    if (data.session) {
      navigate("/dashboard");
      return;
    }

    setMessage(
      "Account created! Please check your email to verify your account."
    );
  };

  if (checkingSession) {
    return (
      <main className="auth-page">
        <div className="auth-card">

          <div className="auth-logo">
            <ShieldCheck size={30} />
            <span>TrustCart</span>
          </div>

          <div className="auth-heading">
            <h1>Checking Account...</h1>

            <p>
              Please wait while we check your login status.
            </p>
          </div>

        </div>
      </main>
    );
  }

  if (alreadyLoggedIn) {
    return (
      <main className="auth-page">

        <div className="auth-card">

          <div className="auth-logo">
            <ShieldCheck size={30} />
            <span>TrustCart</span>
          </div>

          <div className="already-logged">

            <CheckCircle size={50} />

            <h1>You're Already Logged In</h1>

            <p>
              Your TrustCart account is already active.
              You can continue to your dashboard.
            </p>

            <button
              className="primary-btn auth-btn"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
              <ArrowRight size={18} />
            </button>

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">
          <ShieldCheck size={30} />
          <span>TrustCart</span>
        </div>

        <div className="auth-heading">
          <h1>Create Account</h1>

          <p>
            Join TrustCart and shop with confidence.
          </p>
        </div>

        {error && (
          <div className="auth-message error-message">
            {error}
          </div>
        )}

        {message && (
          <div className="auth-message success-message">
            {message}
          </div>
        )}

        <form onSubmit={handleSignup}>

          <div className="auth-field">
            <label>Full Name</label>

            <div className="input-wrapper">
              <User size={18} />

              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Email Address</label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label>Password</label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            className="primary-btn auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}

            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>

      </div>

    </main>
  );
}

export default Signup;