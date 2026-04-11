"use client";
import { useState } from "react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    age: "",
    gender: "",
    occupation: "",
    homeAddress: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (res.ok) {
      // Save name for welcome message on home page
      localStorage.setItem("userName", data.user?.name || formData.name);

      // Redirect to home/map page
      window.location.href = "/home";
    } else {
      setMessage(data.message || "Something went wrong.");
    }
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0f;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: #0a0a0f;
        }

        .left-panel {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px;
          background: linear-gradient(135deg, #0f0c1a 0%, #1a0f2e 50%, #0a1628 100%);
        }

        .left-panel::before {
          content: '';
          position: absolute;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(120, 60, 220, 0.25) 0%, transparent 70%);
          animation: drift 8s ease-in-out infinite;
        }

        .left-panel::after {
          content: '';
          position: absolute;
          bottom: -100px; right: -100px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(30, 120, 255, 0.2) 0%, transparent 70%);
          animation: drift 10s ease-in-out infinite reverse;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -30px); }
        }

        .brand {
          position: relative;
          z-index: 2;
        }

        .brand-mark {
          width: 48px; height: 48px;
          border: 2px solid rgba(180, 140, 255, 0.6);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 48px;
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          color: rgba(180, 140, 255, 0.9);
        }

        .brand h1 {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 4vw, 52px);
          font-weight: 700;
          color: #f0ecff;
          line-height: 1.15;
          margin-bottom: 20px;
        }

        .brand h1 span {
          color: transparent;
          background: linear-gradient(135deg, #a78bfa, #60a5fa);
          -webkit-background-clip: text;
          background-clip: text;
        }

        .brand p {
          font-size: 15px;
          color: rgba(200, 190, 230, 0.55);
          line-height: 1.7;
          max-width: 340px;
          font-weight: 300;
        }

        .grid-lines {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(120, 60, 220, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 60, 220, 0.05) 1px, transparent 1px);
          background-size: 48px 48px;
          z-index: 1;
        }

        .right-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          background: #0d0d14;
        }

        .form-container {
          width: 100%;
          max-width: 440px;
          animation: fadeUp 0.5s ease both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .toggle-bar {
          display: flex;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 4px;
          margin-bottom: 36px;
        }

        .toggle-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: rgba(200, 190, 230, 0.45);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.25s;
          letter-spacing: 0.3px;
        }

        .toggle-btn.active {
          background: rgba(167, 139, 250, 0.15);
          color: #c4b5fd;
          border: 1px solid rgba(167, 139, 250, 0.25);
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: #f0ecff;
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-size: 13px;
          color: rgba(200, 190, 230, 0.4);
          margin-bottom: 28px;
          font-weight: 300;
        }

        .field {
          margin-bottom: 16px;
        }

        .field label {
          display: block;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(180, 160, 240, 0.5);
          margin-bottom: 7px;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 9px;
          padding: 12px 14px;
          color: #e8e0ff;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .field input::placeholder,
        .field textarea::placeholder {
          color: rgba(200, 190, 230, 0.2);
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: rgba(167, 139, 250, 0.5);
          background: rgba(167, 139, 250, 0.06);
        }

        .field select option {
          background: #1a1825;
          color: #e8e0ff;
        }

        .field textarea {
          resize: none;
          height: 80px;
        }

        .two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .submit-btn {
          width: 100%;
          margin-top: 8px;
          padding: 14px;
          background: linear-gradient(135deg, #7c3aed, #3b82f6);
          border: none;
          border-radius: 10px;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .message {
          margin-top: 14px;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 13px;
          text-align: center;
          background: rgba(167, 139, 250, 0.1);
          border: 1px solid rgba(167, 139, 250, 0.2);
          color: #c4b5fd;
        }

        @media (max-width: 768px) {
          .page { grid-template-columns: 1fr; }
          .left-panel { display: none; }
          .right-panel { padding: 24px; align-items: flex-start; padding-top: 60px; }
        }
      `}</style>

      <div className="page">
        <div className="left-panel">
          <div className="grid-lines" />
          <div className="brand">
            <div className="brand-mark">✦</div>
            <h1>Your <span>Space</span><br />Starts Here.</h1>
            <p>Join thousands of users managing their world in one beautifully simple place.</p>
          </div>
        </div>

        <div className="right-panel">
          <div className="form-container">
            <div className="toggle-bar">
              <button className={`toggle-btn ${isLogin ? "active" : ""}`} onClick={() => { setIsLogin(true); setMessage(""); }}>
                Sign In
              </button>
              <button className={`toggle-btn ${!isLogin ? "active" : ""}`} onClick={() => { setIsLogin(false); setMessage(""); }}>
                Register
              </button>
            </div>

            <h2 className="form-title">{isLogin ? "Welcome back" : "Create account"}</h2>
            <p className="form-subtitle">{isLogin ? "Sign in to continue." : "Fill in your details to get started."}</p>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="field">
                    <label>Full Name</label>
                    <input name="name" type="text" placeholder="Jane Doe" value={formData.name} onChange={handleChange} required />
                  </div>

                  <div className="two-col">
                    <div className="field">
                      <label>Age</label>
                      <input name="age" type="number" placeholder="25" min="1" max="120" value={formData.age} onChange={handleChange} required />
                    </div>
                    <div className="field">
                      <label>Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="non-binary">Non-binary</option>
                        <option value="prefer-not-to-say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label>Occupation</label>
                    <input name="occupation" type="text" placeholder="Software Engineer" value={formData.occupation} onChange={handleChange} required />
                  </div>

                  <div className="field">
                    <label>Home Address</label>
                    <textarea name="homeAddress" placeholder="123 Main St, City, Country" value={formData.homeAddress} onChange={handleChange} required />
                  </div>
                </>
              )}

              <div className="field">
                <label>Email Address</label>
                <input name="email" type="email" placeholder="jane@example.com" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="field">
                <label>Password</label>
                <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required />
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Please wait..." : isLogin ? "Sign In →" : "Create Account →"}
              </button>
            </form>

            {message && <div className="message">{message}</div>}
          </div>
        </div>
      </div>
    </>
  );
}