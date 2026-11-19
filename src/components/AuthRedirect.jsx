import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";

function AuthRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // Already logged in → Home
        navigate("/home", { replace: true });
      } else {
        // Not logged in → Login
        navigate("/login", { replace: true });
      }
    };

    checkUser();
  }, [navigate]);

  return (
    <div className="auth-loading">
      <h2>TrustCart</h2>
      <p>Checking your account...</p>
    </div>
  );
}

export default AuthRedirect;