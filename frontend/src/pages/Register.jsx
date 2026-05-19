import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../services/api";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      navigate("/login");
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.detail || "Registration failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f5f7f9] px-4 py-10">
      <div className="w-full max-w-[650px] bg-white border border-gray-200 rounded-2xl shadow-sm p-8">

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create an Account
          </h1>

          <p className="text-gray-500 text-lg">
            Join our community of precision agronomists.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Username */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Username
            </label>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[24px]">
                person
              </span>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="johndoe_agri"
                required
                className="w-full h-16 rounded-2xl border border-gray-300 pl-16 pr-4 text-lg outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Email Address
            </label>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[24px]">
                mail
              </span>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
                className="w-full h-16 rounded-2xl border border-gray-300 pl-16 pr-4 text-lg outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Password
            </label>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[24px]">
                lock
              </span>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full h-16 rounded-2xl border border-gray-300 pl-16 pr-4 text-lg outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 transition"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-lg font-semibold text-gray-700">
              Confirm Password
            </label>

            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[24px]">
                lock_reset
              </span>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full h-16 rounded-2xl border border-gray-300 pl-16 pr-4 text-lg outline-none focus:border-green-600 focus:ring-4 focus:ring-green-100 transition"
              />
            </div>
          </div>

          {/* Terms */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              required
              className="mt-1 h-5 w-5 accent-green-600"
            />

            <p className="text-gray-600">
              I agree to the{" "}
              <span className="text-green-700 font-semibold cursor-pointer hover:underline">
                Terms & Conditions
              </span>{" "}
              and{" "}
              <span className="text-green-700 font-semibold cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 rounded-2xl bg-green-700 hover:bg-green-800 text-white text-lg font-semibold transition duration-200 disabled:opacity-50"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        {/* Login */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-gray-600 text-lg">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-700 font-bold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Register;