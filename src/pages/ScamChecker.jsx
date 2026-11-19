
import { useState } from "react";
import { supabase } from "../services/supabase";
import {
  ShieldCheck,
  AlertTriangle,
  Search,
  CheckCircle,
  Info,
} from "lucide-react";

// Rule-based scam detection
function analyzeScamText(text) {
  const content = text.trim();
  const lower = content.toLowerCase();

  let riskPoints = 0;
  const signals = [];

  const addSignal = (points, message) => {
    riskPoints += points;
    signals.push(message);
  };

  // 1. Requests for sensitive information
  const sensitivePatterns = [
    /\botp\b/i,
    /\bone[- ]time password\b/i,
    /\bshare your password\b/i,
    /\benter your password\b/i,
    /\bpin number\b/i,
    /\bcard details\b/i,
    /\bbank details\b/i,
    /\bcvv\b/i,
    /\baccount credentials\b/i,
  ];

  if (sensitivePatterns.some((pattern) => pattern.test(content))) {
    addSignal(25, "Requests sensitive information such as OTPs, passwords, or banking details.");
  }

  // 2. Urgent or threatening language
  const urgencyPatterns = [
    "account will be blocked",
    "account suspended",
    "act immediately",
    "urgent action required",
    "within 24 hours",
    "final warning",
    "immediately verify",
    "your account will be closed",
    "avoid account suspension",
  ];

  if (urgencyPatterns.some((phrase) => lower.includes(phrase))) {
    addSignal(15, "Uses urgent or threatening language to pressure the recipient.");
  }

  // 3. Payment pressure
  const paymentPatterns = [
    "pay immediately",
    "send money now",
    "transfer the amount",
    "pay processing fee",
    "advance payment",
    "send payment",
    "make payment to claim",
    "refund processing fee",
  ];

  if (paymentPatterns.some((phrase) => lower.includes(phrase))) {
    addSignal(20, "Pressures the recipient to make a payment or transfer money.");
  }

  // 4. Prize and reward scams
  const prizePatterns = [
    "you have won",
    "you are a winner",
    "claim your prize",
    "lucky winner",
    "won a lottery",
    "free iphone",
    "cash reward",
    "claim your reward",
    "congratulations winner",
  ];

  if (prizePatterns.some((phrase) => lower.includes(phrase))) {
    addSignal(20, "Contains unexpected prize, lottery, or reward claims.");
  }

  // 5. Suspicious URLs
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"']+/gi;
  const urls = content.match(urlRegex) || [];

  const shortenedDomains = [
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "is.gd",
    "cutt.ly",
    "rb.gy",
    "shorturl.at",
  ];

  const riskyExtensions = [
    ".xyz",
    ".top",
    ".click",
    ".work",
    ".buzz",
    ".monster",
  ];

  urls.forEach((rawUrl) => {
    try {
      const cleanUrl = rawUrl.replace(/[.,!?;:)]+$/, "");
      const parsed = new URL(
        cleanUrl.startsWith("www.") ? `https://${cleanUrl}` : cleanUrl
      );

      const hostname = parsed.hostname.toLowerCase();

      if (parsed.protocol !== "https:") {
        addSignal(10, "Contains a link that does not use HTTPS encryption.");
      }

      if (shortenedDomains.includes(hostname)) {
        addSignal(15, "Contains a shortened URL that hides the destination.");
      }

      if (riskyExtensions.some((extension) => hostname.endsWith(extension))) {
        addSignal(12, "Contains a link using a less common domain extension.");
      }

      if (hostname.startsWith("xn--") || hostname.includes(".xn--")) {
        addSignal(20, "Contains an internationalized domain that may disguise its appearance.");
      }

      if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)) {
        addSignal(20, "Uses an IP address instead of a recognizable website domain.");
      }

      if (hostname.split(".").length >= 5) {
        addSignal(8, "Uses an unusually long subdomain structure.");
      }
    } catch {
      addSignal(8, "Contains a link that could not be parsed normally.");
    }
  });

  // 6. Suspicious download or attachment instructions
  const attachmentPatterns = [
    "download this apk",
    "install this app",
    "open the attachment",
    "download the file",
    "install this file",
    "enable macros",
  ];

  if (attachmentPatterns.some((phrase) => lower.includes(phrase))) {
    addSignal(15, "Encourages downloading or installing an unexpected file or application.");
  }

  // 7. Requests to move conversations elsewhere
  const externalContactPatterns = [
    "contact me on whatsapp",
    "message me on telegram",
    "continue on whatsapp",
    "send details on telegram",
  ];

  if (externalContactPatterns.some((phrase) => lower.includes(phrase))) {
    addSignal(10, "Encourages moving the conversation to an external messaging platform.");
  }

  // 8. Excessive capital letters
  const letters = content.match(/[a-z]/gi) || [];
  const capitals = content.match(/[A-Z]/g) || [];

  if (letters.length >= 15 && capitals.length / letters.length > 0.5) {
    addSignal(8, "Uses an unusually high amount of capital letters.");
  }

  // 9. Repeated punctuation
  if (/[!?]{3,}/.test(content)) {
    addSignal(5, "Uses excessive repeated punctuation to attract attention.");
  }

  // Cap the score at 100.
  riskPoints = Math.min(riskPoints, 100);

  let status = "Low Risk";
  let message =
    "No major scam warning patterns were detected by these basic checks.";

  if (riskPoints >= 50) {
    status = "High Risk";
    message =
      "Multiple serious warning signs were detected. Avoid sharing information or making payments until the source is independently verified.";
  } else if (riskPoints >= 25) {
    status = "Medium Risk";
    message =
      "Some suspicious patterns were detected. Verify the sender and website before taking action.";
  }

  if (signals.length === 0) {
    signals.push("No suspicious patterns were detected in the provided content.");
  }

  return {
    score: riskPoints,
    status,
    message,
    signals,
    linkCount: urls.length,
  };
}

function ScamChecker() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const checkScam = async () => {
    setErrorMessage("");
    setSaveMessage("");
    setResult(null);

    if (!input.trim()) {
      setErrorMessage("Please paste a message or link to check.");
      return;
    }

    if (input.trim().length < 5) {
      setErrorMessage("Please enter more content for analysis.");
      return;
    }

    setLoading(true);

    try {
      const scamResult = analyzeScamText(input);
      setResult(scamResult);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not get logged-in user:", userError);
        setSaveMessage(
          "Analysis completed, but login status could not be checked."
        );
        return;
      }

      if (!user) {
        setSaveMessage(
          "Analysis completed. Log in to save it to your history."
        );
        return;
      }

      const { error: insertError } = await supabase
        .from("trust_history")
        .insert([
          {
            user_id: user.id,
            type: "scam",
            title: "Scam Check",
            score: scamResult.score,
            risk: scamResult.status,
          },
        ]);

      if (insertError) {
        console.error("Error saving scam history:", insertError);
        setSaveMessage(
          "Analysis completed, but it could not be saved to history."
        );
      } else {
        setSaveMessage("Scam check saved to your TrustCart history.");
      }
    } catch (error) {
      console.error("Scam analysis error:", error);
      setErrorMessage("Something went wrong while checking this content.");
    } finally {
      setLoading(false);
    }
  };

  const riskClass = result
    ? result.status === "High Risk"
      ? "high"
      : result.status === "Medium Risk"
      ? "medium"
      : "low"
    : "";

  return (
    <main className="scam-page">
      <section className="scam-hero">
        <div className="badge">
          <ShieldCheck size={18} />
          Rule-Based Scam Detection
        </div>

        <h1>
          Is This
          <br />
          <span>a Scam?</span>
        </h1>

        <p>
          Paste a suspicious message, email, SMS, or shopping link.
          TrustCart will check it for common scam warning signs.
        </p>
      </section>

      <section className="scam-container">
        <div className="scam-card">
          <label htmlFor="scam-input">
            Suspicious Message or Content
          </label>

          <textarea
            id="scam-input"
            placeholder="Paste a suspicious message, email, SMS, or shopping link here..."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setErrorMessage("");
              setSaveMessage("");
            }}
          />

          <div className="scam-word-count">
            {input.trim() ? input.trim().split(/\s+/).length : 0} words
          </div>

          {errorMessage && (
            <p className="scam-error">{errorMessage}</p>
          )}

          <button
            className="primary-btn scam-btn"
            onClick={checkScam}
            disabled={loading}
          >
            <Search size={20} />
            {loading ? "Checking..." : "Check for Scam"}
          </button>
        </div>

        {result && (
          <div className={`scam-result ${riskClass}`}>
            <div className="scam-result-header">
              {result.status === "Low Risk" ? (
                <CheckCircle size={26} />
              ) : (
                <AlertTriangle size={26} />
              )}

              <h2>Scam Analysis</h2>
            </div>

            <div className="scam-score-section">
              <div className="scam-score">
                <span>{result.score}</span>
                <small>/ 100</small>
              </div>

              <div className="scam-summary">
                <h3>{result.status}</h3>
                <p>{result.message}</p>
                <p className="scam-link-count">
                  Links detected: {result.linkCount}
                </p>
              </div>
            </div>

            <div className="scam-risk-meter">
              <div>
                <span>Scam Risk Score</span>
                <strong>{result.score}/100</strong>
              </div>

              <div className="scam-progress-bar">
                <div
                  className="scam-progress"
                  style={{ width: `${result.score}%` }}
                />
              </div>
            </div>

            <div className="scam-signals">
              <h3>
                <Info size={19} />
                Detected Warning Signs
              </h3>

              <ul>
                {result.signals.map((signal, index) => (
                  <li key={index}>{signal}</li>
                ))}
              </ul>
            </div>

            <div className="scam-warning">
              <AlertTriangle size={20} />

              <div>
                <strong>Stay cautious</strong>
                <p>
                  Never share OTPs, passwords, banking details, or
                  card information with unverified sources. Do not
                  open suspicious links or make unexpected payments.
                </p>
              </div>
            </div>

            <p className="scam-disclaimer">
              This is a preliminary rule-based assessment. It does
              not verify websites, inspect link destinations, or
              prove that a message is fraudulent or genuine.
              Independently verify suspicious sources.
            </p>
          </div>
        )}

        {saveMessage && (
          <p className="scam-save-message">{saveMessage}</p>
        )}
      </section>
    </main>
  );
}

export default ScamChecker;
