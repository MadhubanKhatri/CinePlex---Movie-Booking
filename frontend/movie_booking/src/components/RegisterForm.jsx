import React, { useState } from "react";

function RegisterForm({ onRegister }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    isLogin: false
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.trim() });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onRegister(form);
    
      setForm({
        username: "",
        email: "",
        password: ""
    })
    
  };

  return (
    <form className="form" onSubmit={handleSubmit} style={{ maxWidth: 400, margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: 24, marginTop: 20 }}>Register</h2>
      <div className="form-group">
        <label className="form-label" htmlFor="username">Username</label>
        <input
          className="form-control"
          id="username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label className="form-label" htmlFor="email">Email</label>
        <input
          className="form-control"
          id="email"
          name="email"
          type="email"
          value={form.email}
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
        Register
      </button>
    </form>
  );
}

export default RegisterForm;
