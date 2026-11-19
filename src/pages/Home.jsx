import {
  ShieldCheck,
  Search,
  AlertTriangle,
  Truck,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="badge">
            <ShieldCheck size={18} />
            AI-Powered Consumer Protection
          </div>

          <h1>
            Shop Smarter.
            <br />
            <span>Trust What You Buy.</span>
          </h1>

          <p>
            TrustCart helps online shoppers identify fake reviews,
            scams, delivery risks, and hidden costs before making
            a purchase.
          </p>

          <div className="hero-buttons">
              <Link
    to="/"
    className="primary-btn"
  >
    <ShieldCheck size={20} />
    Get Started
  </Link>

  <Link
    to="/product-analyzer"
    className="secondary-btn"
  >
    <Search size={20} />
    Analyze a Product
  </Link>

  <Link
    to="/scam-checker"
    className="secondary-btn"
  >
    <AlertTriangle size={20} />
    Check a Scam
  </Link>

          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="section-heading">
          <p className="small-heading">WHAT TRUSTCART CAN DO</p>

          <h2>Protection for Every Purchase</h2>

          <p>
            AI-powered tools designed to help you make safer
            and more informed online shopping decisions.
          </p>
        </div>

        <div className="feature-grid">

          <div className="feature-card">
            <div className="icon-box">
              <Search size={26} />
            </div>

            <h3>Fake Review Detection</h3>

            <p>
              Detect suspicious reviews using machine learning
              and natural language processing.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box">
              <AlertTriangle size={26} />
            </div>

            <h3>Scam Detection</h3>

            <p>
              Analyze suspicious messages and links to identify
              potential scams and phishing attempts.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box">
              <Truck size={26} />
            </div>

            <h3>Delivery Risk</h3>

            <p>
              Identify potential delivery problems and shipping
              risks before placing an order.
            </p>
          </div>

          <div className="feature-card">
            <div className="icon-box">
              <DollarSign size={26} />
            </div>

            <h3>Hidden Costs</h3>

            <p>
              Understand additional fees, delivery charges,
              and pricing issues before checkout.
            </p>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-heading">
          <p className="small-heading">HOW IT WORKS</p>

          <h2>Simple. Smart. Transparent.</h2>
        </div>

        <div className="steps">

          <div className="step">
            <div className="step-number">01</div>
            <h3>Enter</h3>
            <p>
              Enter a product review, message, or shopping
              information.
            </p>
          </div>

          <div className="step">
            <div className="step-number">02</div>
            <h3>Analyze</h3>
            <p>
              TrustCart analyzes the information using AI and
              machine learning.
            </p>
          </div>

          <div className="step">
            <div className="step-number">03</div>
            <h3>Understand</h3>
            <p>
              Get a clear risk score and an explanation of
              potential problems.
            </p>
          </div>

          <div className="step">
            <div className="step-number">04</div>
            <h3>Act</h3>
            <p>
              Make a safer and more informed shopping decision.
            </p>
          </div>

        </div>
      </section>
    </main>
  );
}

export default Home;
