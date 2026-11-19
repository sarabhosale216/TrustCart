
import { useState } from "react";
import { supabase } from "../services/supabase";
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";

// Rule-based review analysis.
// This checks text patterns; it is not a trained machine-learning model.
function analyzeReviewText(text) {
  const reviewText = text.trim();
  const lowerText = reviewText.toLowerCase();
  const words = lowerText.match(/\b[\w']+\b/g) || [];

  let riskPoints = 0;
  const signals = [];

  const addSignal = (points, message) => {
    riskPoints += points;
    signals.push(message);
  };

  // 1. Excessive promotional language
  const promotionalPhrases = [
    "best product ever",
    "100% guaranteed",
    "must buy",
    "life changing",
    "buy now",
    "number one product",
    "unbelievable quality",
  ];

  if (promotionalPhrases.some((phrase) => lowerText.includes(phrase))) {
    addSignal(15, "Contains strong promotional or exaggerated phrases.");
  }

  // 2. Urgency or pressure to purchase
  const urgencyPhrases = [
    "hurry",
    "buy immediately",
    "limited offer",
    "don't miss out",
    "order now",
    "act fast",
  ];

  if (urgencyPhrases.some((phrase) => lowerText.includes(phrase))) {
    addSignal(15, "Uses urgency or pressure to encourage a purchase.");
  }

  // 3. Incentives for positive reviews
  const incentivePhrases = [
    "free gift",
    "got paid",
    "sponsored review",
    "received a free product",
    "discount for review",
    "in exchange for review",
  ];

  if (incentivePhrases.some((phrase) => lowerText.includes(phrase))) {
    addSignal(20, "Mentions a possible reward, payment, or incentive.");
  }

  // 4. Excessive capital letters
  const letters = reviewText.match(/[a-z]/gi) || [];
  const capitalLetters = reviewText.match(/[A-Z]/g) || [];
  const capitalRatio =
    letters.length > 0 ? capitalLetters.length / letters.length : 0;

  if (letters.length >= 15 && capitalRatio > 0.5) {
    addSignal(10, "Uses an unusually high amount of capital letters.");
  }

  // 5. Repeated punctuation
  if (/[!?]{3,}/.test(reviewText)) {
    addSignal(8, "Contains repeated exclamation or question marks.");
  }

  // 6. Repeated words
  const wordCounts = {};
  words.forEach((word) => {
    wordCounts[word] = (wordCounts[word] || 0) + 1;
  });

  const repeatedWord = Object.entries(wordCounts).some(
    ([word, count]) =>
      word.length > 3 && count >= 4
  );

  if (repeatedWord) {
    addSignal(10, "Repeats the same word unusually often.");
  }

  // 7. Very short review
  if (words.length < 8) {
    addSignal(8, "The review is very short and provides little detail.");
  }

  // 8. Generic review wording
  const genericPhrases = [
    "very good product",
    "excellent product",
    "nice product",
    "awesome product",
    "highly recommended",
    "worth every penny",
  ];

  if (genericPhrases.some((phrase) => lowerText.includes(phrase))) {
    addSignal(8, "Uses generic praise without much specific detail.");
  }

  // Keep the risk score within 0–100.
  riskPoints = Math.min(riskPoints, 100);

  const trustScore = 100 - riskPoints;

  let riskLevel = "Low Risk";
  let description =
    "No major warning patterns were detected by these basic checks.";

  if (riskPoints >= 40) {
    riskLevel = "High Risk";
    description =
      "Several warning patterns were detected. Check the review carefully.";
  } else if (riskPoints >= 20) {
    riskLevel = "Medium Risk";
    description =
      "Some warning patterns were detected. Read the review with caution.";
  }

  if (signals.length === 0) {
    signals.push("No suspicious text patterns were detected.");
  }

  return {
    trustScore,
    riskPoints,
    riskLevel,
    description,
    signals,
    wordCount: words.length,
  };
}

function ProductAnalyzer() {
  const [review, setReview] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const analyzeReview = async () => {
    setErrorMessage("");
    setSaveMessage("");
    setResult(null);

    if (!review.trim()) {
      setErrorMessage("Please paste a product review before analyzing.");
      return;
    }

    if (review.trim().length < 10) {
      setErrorMessage("Please enter a little more text for a useful analysis.");
      return;
    }

    setLoading(true);

    try {
      // Run the local rule-based checks.
      const analysisResult = analyzeReviewText(review);
      setResult(analysisResult);

      // Save the result for the logged-in user.
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not get logged-in user:", userError);
        setSaveMessage("Analysis completed, but login status could not be checked.");
        return;
      }

      if (!user) {
        setSaveMessage("Analysis completed. Log in to save it to your history.");
        return;
      }

      const { error: insertError } = await supabase
        .from("trust_history")
        .insert([
          {
            user_id: user.id,
            type: "review",
            title: "Product Review",
            score: analysisResult.trustScore,
            risk: analysisResult.riskLevel,
          },
        ]);

      if (insertError) {
        console.error("Error saving review history:", insertError);
        setSaveMessage("Analysis completed, but it could not be saved to history.");
      } else {
        setSaveMessage("Analysis saved to your TrustCart history.");
      }
    } catch (error) {
      console.error("Review analysis error:", error);
      setErrorMessage("Something went wrong while analyzing this review.");
    } finally {
      setLoading(false);
    }
  };

  const getRiskClass = () => {
    if (!result) return "";
    if (result.riskLevel === "High Risk") return "high";
    if (result.riskLevel === "Medium Risk") return "medium";
    return "low";
  };

  return (
    <main className="analyzer-page">
      <section className="analyzer-hero">
        <div className="badge">
          <ShieldCheck size={18} />
          Rule-Based Review Analysis
        </div>

        <h1>
          Is This Review
          <br />
          <span>Trustworthy?</span>
        </h1>

        <p>
          Paste a product review below. TrustCart checks for suspicious
          wording, repeated patterns, promotional language, and other
          warning signs.
        </p>
      </section>

      <section className="analyzer-container">
        <div className="analyzer-card">
          <label htmlFor="product-review">Product Review</label>

          <textarea
            id="product-review"
            placeholder="Paste the product review here..."
            value={review}
            onChange={(e) => {
              setReview(e.target.value);
              setErrorMessage("");
              setSaveMessage("");
            }}
          />

          <div className="analyzer-word-count">
            {review.trim()
              ? review.trim().split(/\s+/).length
              : 0}{" "}
            words
          </div>

          {errorMessage && (
            <p className="analyzer-error">{errorMessage}</p>
          )}

          <button
            className="primary-btn analyze-btn"
            onClick={analyzeReview}
            disabled={loading}
          >
            <Search size={20} />
            {loading ? "Analyzing..." : "Analyze Review"}
          </button>
        </div>

        {result && (
          <div className={`result-card ${getRiskClass()}`}>
            <div className="result-header">
              {result.riskLevel === "Low Risk" ? (
                <CheckCircle size={25} />
              ) : (
                <AlertTriangle size={25} />
              )}
              <h2>Analysis Result</h2>
            </div>

            <div className="result-main">
              <div className="score-circle">
                <span>{result.trustScore}</span>
                <small>/ 100</small>
              </div>

              <div className="result-summary">
                <h3>{result.riskLevel}</h3>
                <p>{result.description}</p>
                <p className="result-word-count">
                  Review length: {result.wordCount} words
                </p>
              </div>
            </div>

            <div className="probability">
              <div>
                <span>Preliminary Risk Score</span>
                <strong>{result.riskPoints}/100</strong>
              </div>

              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${result.riskPoints}%` }}
                />
              </div>
            </div>

            <div className="signals-section">
              <h3>
                <Info size={18} />
                Detected Signals
              </h3>

              <ul>
                {result.signals.map((signal, index) => (
                  <li key={index}>{signal}</li>
                ))}
              </ul>
            </div>

            <p className="analyzer-disclaimer">
              This is a basic rule-based assessment, not proof that a review
              is genuine or fake. Always consider the seller, verified
              purchases, and other customer feedback.
            </p>
          </div>
        )}

        {saveMessage && (
          <p className="analyzer-save-message">{saveMessage}</p>
        )}
      </section>
    </main>
  );
}

export default ProductAnalyzer;
