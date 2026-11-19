
import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  FileText,
  Activity,
  RefreshCw,
  Package,
  Clock,
} from "lucide-react";

function Dashboard() {
  const [activities, setActivities] = useState([]);
  const [userName, setUserName] = useState("Customer");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;

      if (!user) {
        setErrorMessage("Please log in to view your dashboard.");
        setActivities([]);
        setLoading(false);
        return;
      }

      const metadata = user.user_metadata || {};

      setUserName(
        metadata.full_name ||
        metadata.name ||
        metadata.fullName ||
        user.email?.split("@")[0] ||
        "Customer"
      );

      const { data, error } = await supabase
        .from("trust_history")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      const sortedActivities = (data || []).sort((a, b) => {
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      });

      setActivities(sortedActivities);
    } catch (error) {
      console.error("Dashboard loading error:", error);
      setErrorMessage("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const normalizedType = (activity) =>
    (activity.type || "").toLowerCase();

  const productActivities = activities.filter((item) =>
    normalizedType(item).includes("product")
  );

  const scamActivities = activities.filter((item) =>
    normalizedType(item).includes("scam")
  );

  const complaintActivities = activities.filter((item) =>
    normalizedType(item).includes("complaint")
  );

  const highRiskScams = scamActivities.filter((item) => {
    const risk = (item.risk || "").toLowerCase();
    return risk.includes("high") || Number(item.score) >= 50;
  });

  const getRiskLevel = (activity) => {
    const risk = (activity.risk || "").toLowerCase();

    if (risk.includes("high") || Number(activity.score) >= 70) {
      return "High";
    }

    if (risk.includes("medium") || Number(activity.score) >= 40) {
      return "Medium";
    }

    if (
      risk.includes("low") ||
      risk.includes("safe") ||
      risk.includes("drafted")
    ) {
      return "Low";
    }

    return "Recorded";
  };

  const getActivityIcon = (activity) => {
    const type = normalizedType(activity);
    const risk = getRiskLevel(activity);

    if (type.includes("scam")) {
      return risk === "High" ? AlertTriangle : ShieldCheck;
    }

    if (type.includes("complaint")) return FileText;

    return Package;
  };

  const getActivityClass = (activity) => {
    const type = normalizedType(activity);
    const risk = getRiskLevel(activity);

    if (type.includes("complaint")) return "safe";
    if (risk === "High") return "danger";
    if (risk === "Medium") return "warning";

    return "safe";
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

const riskCategories = [
  {
    label: "Product Reviews",
    items: productActivities,
    className: "review-risk",
  },
  {
    label: "Scam Checks",
    items: scamActivities,
    className: "scam-risk",
  },
];

  const getCategoryRisk = (items) => {
    if (!items.length) return 0;

    const risky = items.filter((item) => {
      const level = getRiskLevel(item);
      return level === "High" || level === "Medium";
    }).length;

    return Math.round((risky / items.length) * 100);
  };

  return (
    <main className="dashboard-page">
      {/* Header */}
      <section className="dashboard-header">
        <div>
          <p className="small-heading">TRUSTCART DASHBOARD</p>

          <h1>Welcome, {userName}!</h1>

          <p>
            Here's your shopping safety overview.
            Keep track of your checks and stay informed
            about potential online shopping risks.
          </p>
        </div>

        <div className="overall-score">
          <ShieldCheck size={26} />

          <div>
            <span>Your Protection Activity</span>
            <strong>{activities.length}</strong>
            <small>total records</small>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity size={22} />
          </div>

          <div>
            <span>Total Activities</span>
            <strong>{activities.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Search size={22} />
          </div>

          <div>
            <span>Products Analyzed</span>
            <strong>{productActivities.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon warning">
            <AlertTriangle size={22} />
          </div>

          <div>
            <span>Scams Detected</span>
            <strong>{highRiskScams.length}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <FileText size={22} />
          </div>

          <div>
            <span>Complaints Generated</span>
            <strong>{complaintActivities.length}</strong>
          </div>
        </div>
      </section>

      {/* Loading and error states */}
      {loading && (
        <div className="dashboard-card dashboard-message">
          <RefreshCw size={20} />
          Loading your dashboard...
        </div>
      )}

      {!loading && errorMessage && (
        <div className="dashboard-card dashboard-message">
          <AlertTriangle size={20} />
          {errorMessage}

          <button onClick={fetchDashboardData}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !errorMessage && (
        <section className="dashboard-grid">
          {/* Recent Activity */}
          <div className="dashboard-card activity-card">
            <div className="card-heading">
              <div>
                <h2>Recent Activity</h2>
                <p>Your latest TrustCart records</p>
              </div>

              <Activity size={22} />
            </div>

            <div className="activity-list">
              {activities.length === 0 ? (
                <div className="dashboard-empty">
                  <Clock size={32} />

                  <h3>No activity yet</h3>

                  <p>
                    Your product analyses, scam checks and
                    generated complaints will appear here.
                  </p>
                </div>
              ) : (
                activities.slice(0, 8).map((item) => {
                  const Icon = getActivityIcon(item);
                  const activityClass = getActivityClass(item);
                  const risk = getRiskLevel(item);

                  return (
                    <div
                      className="activity-item"
                      key={item.id || `${item.type}-${item.title}-${item.created_at}`}
                    >
                      <div className={`activity-icon ${activityClass}`}>
                        <Icon size={18} />
                      </div>

                      <div className="activity-info">
                        <strong>{item.title || "TrustCart Activity"}</strong>
                        <span>
                          {item.type || "Activity"} ·{" "}
                          {formatDate(item.created_at)}
                        </span>
                      </div>

                      <span className={`risk ${activityClass}-text`}>
                        {risk}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Risk Summary */}
          <div className="dashboard-card">
            <div className="card-heading">
              <div>
                <h2>Risk Summary</h2>
                <p>Based on your saved checks</p>
              </div>

              <ShieldCheck size={22} />
            </div>

            <div className="risk-summary">
              {riskCategories.map((category) => {
                const percentage = getCategoryRisk(category.items);

                return (
                  <div className="risk-row" key={category.label}>
                    <span>{category.label}</span>

                    <div className="risk-bar">
                      <div
                        className={`risk-fill ${category.className}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <strong>
                      {category.items.length === 0
                        ? "No data"
                        : `${percentage}%`}
                    </strong>
                  </div>
                );
              })}

              <div className="risk-row">
                <span>Complaints</span>

                <div className="risk-bar">
                  <div
                    className="risk-fill"
                    style={{
                      width: complaintActivities.length ? "100%" : "0%",
                    }}
                  />
                </div>

                <strong>
                  {complaintActivities.length}
                </strong>
              </div>
            </div>

            <p className="risk-summary-note">
              Risk percentages represent the proportion of
              medium- and high-risk records in each category.
              They are not an overall safety score.
            </p>
          </div>
        </section>
      )}
    </main>
  );
}

export default Dashboard;
