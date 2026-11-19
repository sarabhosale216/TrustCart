import {
  ShieldCheck,
  User,
  Settings,
  History,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";

function Navbar() {
  const [showMenu, setShowMenu] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    // Get currently logged-in user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setShowMenu(false);

    navigate("/login");
  };

  return (
    <nav className="navbar">

      <div className="logo">
        <ShieldCheck size={30} />
        <span>TrustCart</span>
      </div>

      <div className="nav-links">
        <Link to="/">Home</Link>
        <Link to="/product-analyzer">Product Analyzer</Link>
        <Link to="/scam-checker">Scam Checker</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/complaint-assistant">Complaints</Link>
      </div>

      <div className="profile-container">

        <button
          className="profile-button"
          onClick={() => setShowMenu(!showMenu)}
        >
          <User size={22} />
        </button>

        {showMenu && (
          <div className="profile-menu">

            <div className="profile-menu-header">

              <div className="account-icon">
                <User size={24} />
              </div>

              <div>
                <strong>
                  {user?.user_metadata?.name ||
                    user?.user_metadata?.full_name ||
                    "My Account"}
                </strong>

                <span>
                  {user?.email
                   ? user.email.split("@")[0]
                   : "TrustCart User"}
                </span>
              </div>

            </div>

            <Link to="/profile"
             onClick={() => setShowMenu(false)}>
              <User size={22} />
              Profile
            </Link>

            <Link to="/settings"
             onClick={() => setShowMenu(false)}>
              <Settings size={22} />
              Settings
            </Link>

            <Link to="/trust-history" onClick={() => setShowMenu(false)}>
             <History size={22} />
               Trust History
            </Link>

            <button
              className="logout-menu"
              onClick={handleLogout}
            >
              <LogOut size={22} />
              Logout
            </button>

          </div>
        )}

      </div>

    </nav>
  );
}

export default Navbar;