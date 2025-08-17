import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "../axiosConfig";
import { useAuth } from "../context/AuthContext";

// Lightweight inline icons (no extra deps)
const Eye = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
    <path fill="currentColor"
      d="M12 5c-5 0-9 4.5-10 7 1 2.5 5 7 10 7s9-4.5 10-7c-1-2.5-5-7-10-7zm0 12a5 5 0 1 1 0-10 5 5 0 0 1 0 10z"/>
    <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
  </svg>
);
const EyeOff = (props) => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden {...props}>
    <path fill="currentColor"
      d="M3.3 1.9 1.9 3.3 5 6.4C3 7.8 1.7 9.5 1 12c1 2.5 5 7 11 7 2.2 0 4.1-.6 5.7-1.5l2.1 2.1 1.4-1.4L3.3 1.9zM7.6 9l1.7 1.7a3.5 3.5 0 0 0 4 4L15 16c-.8.3-1.7.5-2.7.5a5 5 0 0 1-4.7-7.5zM12 5c5 0 9 4.5 10 7-.4 1-1.2 2.2-2.4 3.5l-3-3A5 5 0 0 0 9.5 7.4L7.9 5.8C9.1 5.3 10.5 5 12 5z"/>
  </svg>
);

// Reusable password field with icon toggle
function PasswordField({ label, name, value, onChange, show, setShow, autoComplete = "new-password" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 pr-10"
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required
          minLength={8}
        />
        <button
          type="button"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-0 my-auto p-3 text-gray-600 hover:text-gray-900"
        >
          {show ? <EyeOff /> : <Eye />}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-1">Use at least 8 characters.</p>
    </div>
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { setUserAfterAuth } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    if (!form.name.trim()) return "Name is required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return "Valid email is required";
    if (form.password.length < 8) return "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) return "Passwords do not match";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const msg = validate();
    if (msg) return setError(msg);

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        address: form.address || undefined,
      };
      const { data } = await axios.post("/auth/register", payload);
      setUserAfterAuth(data);
      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 409 || err?.response?.status === 400
          ? "User already exists or invalid data"
          : "Sign up failed");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Urban IFS</h1>
          <p className="text-gray-600">Create your account to start reporting infrastructure issues</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="ml-3 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                name="name"
                value={form.name}
                onChange={onChange}
                autoComplete="name"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                autoComplete="email"
                placeholder="Enter your email address"
                required
              />
            </div>

            <PasswordField
              label="Password"
              name="password"
              value={form.password}
              onChange={onChange}
              show={showPw}
              setShow={setShowPw}
            />

            <PasswordField
              label="Confirm Password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={onChange}
              show={showConfirm}
              setShow={setShowConfirm}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address (optional)</label>
              <input
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                name="address"
                value={form.address}
                onChange={onChange}
                autoComplete="street-address"
                placeholder="Enter your address"
              />
              <p className="text-xs text-gray-500 mt-1">This helps us provide better location-based services</p>
            </div>

            <button
              disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
