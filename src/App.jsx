import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthRedirect from "./components/AuthRedirect";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductAnalyzer from "./pages/ProductAnalyzer";
import ScamChecker from "./pages/ScamChecker";
import Dashboard from "./pages/Dashboard";
import ComplaintAssistant from "./pages/ComplaintAssistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import "./App.css";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import TrustHistory from "./pages/TrustHistory";

function App() {
  useEffect(() => {
  const savedTheme = localStorage.getItem("trustcart-theme");

  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  } else {
    document.body.classList.remove("light-mode");
  }
}, []);

  return (
    <BrowserRouter>

      <Navbar />

      <Routes>
        <Route path="/" element={<AuthRedirect />} />

        <Route path="/home" element={<Home />} />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/product-analyzer"
          element={<ProductAnalyzer />}
        />

        <Route
          path="/scam-checker"
          element={<ScamChecker />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/complaint-assistant"
          element={<ComplaintAssistant />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route path="/settings" element={<Settings />} />

        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/trust-history" element={<TrustHistory />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;