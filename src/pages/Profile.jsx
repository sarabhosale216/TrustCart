import { useEffect, useState } from "react";
import { User, Mail, AtSign, ShieldCheck } from "lucide-react";
import { supabase } from "../services/supabase";

function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();
  }, []);

  const name =
    user?.user_metadata?.name ||
    user?.user_metadata?.full_name ||
    "User";

  const username = user?.email
    ? user.email.split("@")[0]
    : "user";

  return (
    <main className="profile-page">

      <div className="profile-heading">
        <p>MY ACCOUNT</p>
        <h1>My Profile</h1>
        <span>Manage your TrustCart account</span>
      </div>

      <div className="profile-card">

        <div className="profile-avatar">
          <User size={48} />
        </div>

        <h2>{name}</h2>

        <p className="profile-username">
          @{username}
        </p>

        <div className="profile-divider"></div>

        <div className="profile-info">

          <div className="profile-info-item">
            <div className="profile-info-icon">
              <User size={21} />
            </div>

            <div>
              <span>Full Name</span>
              <strong>{name}</strong>
            </div>
          </div>

          <div className="profile-info-item">
            <div className="profile-info-icon">
              <AtSign size={21} />
            </div>

            <div>
              <span>Username</span>
              <strong>{username}</strong>
            </div>
          </div>

          <div className="profile-info-item">
            <div className="profile-info-icon">
              <Mail size={21} />
            </div>

            <div>
              <span>Email Address</span>
              <strong>{user?.email}</strong>
            </div>
          </div>

          <div className="profile-info-item">
            <div className="profile-info-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <span>Account Status</span>
              <strong className="verified">
                Verified Account
              </strong>
            </div>
          </div>

        </div>

      </div>

    </main>
  );
}

export default Profile;