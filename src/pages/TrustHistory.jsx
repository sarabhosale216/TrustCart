import { useEffect, useState } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { supabase } from "../services/supabase";

function TrustHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError("");

      // Get currently logged-in user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Please log in to view your trust history.");
        setLoading(false);
        return;
      }

      // Get only this user's history
      const { data, error } = await supabase
        .from("trust_history")
        .select("*")
        .eq("user_id", user.id)
        .order("id", { ascending: false });

      if (error) {
        console.error("Error loading trust history:", error);
        setError("Unable to load your trust history.");
        setLoading(false);
        return;
      }

      setHistory(data || []);
      setLoading(false);
    };

    loadHistory();
  }, []);

  return (
    <main className="history-page">

      <section className="history-header">

        <div className="badge">
          <Clock size={18} />
          Trust History
        </div>

        <h1>
          Your <span>Trust History</span>
        </h1>

        <p>
          Review your previous product and scam analyses
          in one place.
        </p>

      </section>

      <section className="history-container">

        {loading && (
          <div className="history-message">
            Loading your trust history...
          </div>
        )}

        {error && (
          <div className="history-message error-message">
            {error}
          </div>
        )}

        {!loading && !error && history.length === 0 && (
          <div className="history-empty">
            <ShieldCheck size={45} />

            <h2>No History Yet</h2>

            <p>
              Your product and scam checks will appear here
              after you use TrustCart.
            </p>
          </div>
        )}

        {!loading && !error && history.length > 0 && (

          <div className="history-list">

            {history.map((item) => (

              <div
                className="history-card"
                key={item.id}
              >

                <div className="history-icon">

                  {item.type === "scam" ? (
                    <AlertTriangle size={24} />
                  ) : (
                    <ShieldCheck size={24} />
                  )}

                </div>

                <div className="history-info">

                  <h3>{item.title}</h3>

                  <span>
                    {item.type === "scam"
                      ? "Scam Check"
                      : "Product Review"}
                  </span>

                </div>

                <div className="history-score">

                  <strong>
                    {item.score}
                  </strong>

                  <small>
                    / 100
                  </small>

                </div>

                <div
                  className={`history-risk ${
                    item.risk
                      ?.toLowerCase()
                      .includes("scam") ||
                    item.risk
                      ?.toLowerCase()
                      .includes("suspicious")
                      ? "danger"
                      : "safe"
                  }`}
                >
                  {item.risk}
                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  );
}

export default TrustHistory;
