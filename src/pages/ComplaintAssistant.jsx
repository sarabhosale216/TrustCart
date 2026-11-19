
import { useState } from "react";
import { supabase } from "../services/supabase";
import {
  FileText,
  Send,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function ComplaintAssistant() {
  const [problem, setProblem] = useState("");
  const [platform, setPlatform] = useState("");
  const [outcome, setOutcome] = useState("");
  const [issueType, setIssueType] = useState("Delayed Delivery");
  const [complaint, setComplaint] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const generateComplaint = async () => {
    setErrorMessage("");
    setSaveMessage("");
    setCopied(false);

    if (!problem.trim() || !platform.trim() || !outcome.trim()) {
      setErrorMessage(
        "Please complete all fields before generating your complaint."
      );
      return;
    }

    if (problem.trim().length < 10) {
      setErrorMessage(
        "Please describe your problem in a little more detail."
      );
      return;
    }

    // Get the logged-in user's name from Supabase.
    let user = null;

    try {
      const {
        data: { user: loggedInUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("Could not check login:", userError);
      } else {
        user = loggedInUser;
      }
    } catch (error) {
      console.error("Could not retrieve user:", error);
    }

    const metadata = user?.user_metadata || {};

    const userName =
      metadata.full_name ||
      metadata.name ||
      metadata.fullName ||
      user?.email?.split("@")[0] ||
      "Customer";

    const subjects = {
      "Delayed Delivery": `Request for an Update on My Delayed Order - ${platform.trim()}`,
      "Refund Issue": `Follow-up Regarding My Refund - ${platform.trim()}`,
      "Damaged Product": `Request for Assistance with a Damaged Product - ${platform.trim()}`,
      "Wrong Item": `Incorrect Item Received - Request for Resolution`,
      "Order Cancellation": `Request for Assistance with Order Cancellation`,
      Other: `Request for Assistance Regarding a Recent Purchase`,
    };

    
const introductions = {
  "Delayed Delivery":
    `I am writing to formally raise a complaint regarding the delay in the delivery of my order placed through ${platform.trim()}.`,
  "Refund Issue":
    `I am writing to express my dissatisfaction with the unresolved refund issue concerning my purchase through ${platform.trim()}.`,
  "Damaged Product":
    `I am writing to formally complain about receiving a damaged product from ${platform.trim()}.`,
  "Wrong Item":
    `I am writing to raise a complaint regarding an incorrect item delivered against my order placed through ${platform.trim()}.`,
  "Order Cancellation":
    `I am writing to express my concern regarding the difficulties I have faced with the cancellation of my order through ${platform.trim()}.`,
  Other:
    `I am writing to formally bring to your attention an unsatisfactory experience with a recent purchase through ${platform.trim()}.`,
};

const generatedComplaint = `Subject: Formal Complaint - ${subjects[issueType]}

Dear ${platform.trim()} Customer Support Team,

I am writing to formally register a complaint regarding an issue with my recent purchase through your platform.

${introductions[issueType]}

Details of the issue:
${problem.trim()}

This experience has caused considerable inconvenience and disappointment. As a customer, I expected a satisfactory service and a timely resolution. Unfortunately, the issue remains unresolved.

I therefore expect your team to investigate this matter and take the necessary corrective action. My requested resolution is as follows:

${outcome.trim()}

I request that this complaint be treated as a priority and that a clear response and resolution be provided within a reasonable timeframe. I also expect to be informed of the steps being taken to address this issue.

I hope this matter will be handled seriously and resolved without the need for further escalation.

Regards,
${userName}`;


    setComplaint(generatedComplaint);

    // Save the activity to TrustCart history.
    if (!user) {
      setSaveMessage(
        "Complaint generated. Log in to save it to your TrustCart history."
      );
      return;
    }

    try {
      const { error: insertError } = await supabase
        .from("trust_history")
        .insert([
          {
            user_id: user.id,
            type: "complaint",
            title: `Complaint - ${issueType}`,
            score: 0,
            risk: "Drafted",
          },
        ]);

      if (insertError) {
        console.error("Error saving complaint history:", insertError);
        setSaveMessage(
          "Complaint generated, but could not be saved to history."
        );
      } else {
        setSaveMessage(
          "Complaint activity saved to your TrustCart history."
        );
      }
    } catch (error) {
      console.error("Complaint history error:", error);
      setSaveMessage(
        "Complaint generated, but history could not be updated."
      );
    }
  };

  const copyComplaint = async () => {
    try {
      await navigator.clipboard.writeText(complaint);
      setCopied(true);
    } catch (error) {
      console.error("Copy failed:", error);
      setErrorMessage(
        "Unable to copy automatically. Please select and copy the complaint manually."
      );
    }
  };

  return (
    <main className="complaint-page">
      <section className="complaint-hero">
        <div className="badge">
          <FileText size={18} />
          Complaint Assistant
        </div>

        <h1>
          Turn Your Problem
          <br />
          <span>Into Action.</span>
        </h1>

        <p>
          Describe your shopping problem and TrustCart will
          help you create a clear, professional customer support complaint.
        </p>
      </section>

      <section className="complaint-container">
        <div className="complaint-card">
          <div className="form-group">
            <label htmlFor="issue-type">What is your issue about?</label>

            <select
              id="issue-type"
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
            >
              <option>Delayed Delivery</option>
              <option>Refund Issue</option>
              <option>Damaged Product</option>
              <option>Wrong Item</option>
              <option>Order Cancellation</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="problem">What problem did you face?</label>

            <textarea
              id="problem"
              placeholder="Example: My order was supposed to arrive on Monday but it has still not arrived..."
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="platform">Which platform did you use?</label>

            <input
              id="platform"
              type="text"
              placeholder="Example: Amazon, Flipkart, Myntra..."
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="outcome">What outcome do you want?</label>

            <textarea
              id="outcome"
              className="short-input"
              placeholder="Example: I want a full refund or a replacement..."
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            />
          </div>

          {errorMessage && (
            <p className="complaint-error">
              <AlertCircle size={16} />
              {errorMessage}
            </p>
          )}

          <button
            className="primary-btn complaint-btn"
            onClick={generateComplaint}
          >
            <Send size={20} />
            Generate Complaint
          </button>
        </div>

        {complaint && (
          <div className="complaint-result">
            <div className="complaint-result-header">
              <div>
                <div className="result-title">
                  <CheckCircle size={22} />
                  Complaint Generated
                </div>

                <p>
                  Review your complaint, then copy it and send it
                  to the platform's customer support.
                </p>
              </div>

              <button className="copy-btn" onClick={copyComplaint}>
                {copied ? (
                  <>
                    <CheckCircle size={17} />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={17} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="complaint-text">{complaint}</div>

            {saveMessage && (
              <p className="complaint-save-message">{saveMessage}</p>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

export default ComplaintAssistant;
