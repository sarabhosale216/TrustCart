import { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Bell,
  ShieldCheck,
  Mail,
} from "lucide-react";
import { supabase } from "../services/supabase";

function Settings() {
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("trustcart-theme");
    const savedNotifications =
      localStorage.getItem("trustcart-notifications");

    if (savedTheme) {
      setDarkMode(savedTheme === "dark");
    }

    if (savedNotifications !== null) {
      setNotifications(savedNotifications === "true");
    }
  }, []);

  const handleThemeChange = (value) => {
    setDarkMode(value);

    localStorage.setItem(
      "trustcart-theme",
      value ? "dark" : "light"
    );

    document.body.classList.toggle("light-mode", !value);
  };

  const handleNotificationsChange = (value) => {
    setNotifications(value);

    localStorage.setItem(
      "trustcart-notifications",
      value
    );
  };

  const handlePasswordReset = async () => {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      setMessage("Unable to find your account email.");
      return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(
      user.email,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Password reset link has been sent to your email."
      );
    }
  };

  return (
    <main className="settings-page">

      <div className="settings-heading">
        <p>ACCOUNT</p>

        <h1>Settings</h1>

        <span>
          Manage your TrustCart preferences
        </span>
      </div>

      <div className="settings-container">

        {/* Appearance */}

        <section className="settings-section">

          <div className="settings-section-title">
            <div className="settings-title-icon">
              <SettingsIcon size={22} />
            </div>

            <div>
              <h2>Appearance</h2>
              <p>Customize how TrustCart looks.</p>
            </div>
          </div>

          <div className="setting-row">

            <div className="setting-info">

              {darkMode ? (
                <Moon size={21} />
              ) : (
                <Sun size={21} />
              )}

              <div>
                <strong>Dark Mode</strong>

                <span>
                  Use the dark TrustCart interface.
                </span>
              </div>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={darkMode}
                onChange={(e) =>
                  handleThemeChange(e.target.checked)
                }
              />

              <span className="slider"></span>

            </label>

          </div>

        </section>


        {/* Notifications */}

        <section className="settings-section">

          <div className="settings-section-title">

            <div className="settings-title-icon">
              <Bell size={22} />
            </div>

            <div>
              <h2>Notifications</h2>

              <p>
                Control TrustCart notifications.
              </p>
            </div>

          </div>

          <div className="setting-row">

            <div className="setting-info">

              <Bell size={21} />

              <div>

                <strong>Notifications</strong>

                <span>
                  Receive alerts about your TrustCart activity.
                </span>

              </div>

            </div>

            <label className="toggle">

              <input
                type="checkbox"
                checked={notifications}
                onChange={(e) =>
                  handleNotificationsChange(
                    e.target.checked
                  )
                }
              />

              <span className="slider"></span>

            </label>

          </div>

        </section>


        {/* Security */}

        <section className="settings-section">

          <div className="settings-section-title">

            <div className="settings-title-icon">
              <ShieldCheck size={22} />
            </div>

            <div>

              <h2>Security</h2>

              <p>
                Manage your account security.
              </p>

            </div>

          </div>

          <div className="security-row">

            <div className="setting-info">

              <Mail size={21} />

              <div>

                <strong>Reset Password</strong>

                <span>
                  Receive an email to create a new password.
                </span>

              </div>

            </div>

            <button
              className="reset-password-btn"
              onClick={handlePasswordReset}
            >
              Reset Password
            </button>

          </div>

          {message && (
            <div className="settings-message">
              {message}
            </div>
          )}

        </section>

      </div>

    </main>
  );
}

export default Settings;