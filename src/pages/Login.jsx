import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
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

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      navigate("/dashboard");
    }
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
          <h1>Welcome Back</h1>

          <p>
            Sign in to continue protecting your
            online purchases.
          </p>
        </div>

        {error && (
          <div className="auth-message error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>

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
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

            </div>

          </div>


          <button
            className="primary-btn auth-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}

            {!loading && (
              <ArrowRight size={18} />
            )}
          </button>

        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup">
            Create one
          </Link>
        </p>

      </div>

    </main>
  );
}

export default Login;