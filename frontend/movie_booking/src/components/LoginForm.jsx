import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function LoginForm({ onLogin, error }) {
  const [form, setForm] = useState({
    username: "",
    password: "",
    isLogin: true
  });


  const [showError, setShowError] = useState(!!error);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setShowError(!!error);
    setLoading(false); // Stop loading when error changes (response received)
  }, [error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true); // Start loading on submit
    if (onLogin) onLogin(form);
    setForm({
        username: "",
        password: ""
    });
  };

  return (
    <form className="form" onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, marginTop: 20 }}>Login</h2>
      <div className="form-group">
        {loading && (
          <div
            className="loading-message"
            style={{
              background: "#e0e7ff",
              border: "1px solid #a5b4fc",
              color: "#3730a3",
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "16px",
              position: "relative"
            }}
          >
            Loading...
          </div>
        )}
        {error && showError && !loading && (
          <div
            className="error-message"
            style={{
              background: "#ffe0e0",
              border: "1px solid #ffb3b3",
              color: "#b30000",
              padding: "12px 16px",
              borderRadius: "6px",
              marginBottom: "16px",
              position: "relative"
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setShowError(false)}
              style={{
                position: "absolute",
                top: 6,
                right: 10,
                background: "none",
                border: "none",
                fontWeight: "bold",
                fontSize: "18px",
                color: "#b30000",
                cursor: "pointer",
                lineHeight: 1
              }}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}
        <label className="form-label" htmlFor="username">Username</label>
        <input
          className="form-control"
          id="username"
          name="username"
          type="username"
          value={form.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="password">Password</label>
        <input
          className="form-control"
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          required
        />
      </div>
      <button className="btn btn--primary btn--full-width" type="submit">
        Login
      </button>
    </form>
  );
}

export default LoginForm;
