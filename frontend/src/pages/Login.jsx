import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(username, password);
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.detail || 'Invalid credentials';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <main className="flex-grow flex items-center justify-center px-md py-xl min-h-screen">
      <div className="w-full max-w-[440px] flex flex-col gap-xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-md">
          <div className="w-16 h-16 bg-primary-container rounded-xl flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-on-primary-container text-4xl">
              biotech
            </span>
          </div>
          <div className="text-center">
            <h1 className="font-headline-lg text-headline-lg text-on-surface">AgroLens</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Precision Diagnostics for Agriculture
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-surface border border-outline-variant rounded-xl p-lg shadow-sm">
          {error && (
            <div className="mb-lg bg-error-container border border-error/20 p-md rounded-lg flex items-start gap-md">
              <span className="material-symbols-outlined text-error">error</span>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md text-on-error-container">
                  Authentication Failed
                </span>
                <span className="font-body-md text-body-md text-on-error-container opacity-80">
                  {error}
                </span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-lg">
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant px-xs" htmlFor="username">
                Username or Email
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                  person
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-12 pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all font-body-md text-body-md placeholder:text-outline"
                  placeholder="Enter your username"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant px-xs" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-[48px] pr-md bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-0 transition-all font-body-md text-body-md placeholder:text-outline"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-base cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-outline rounded focus:ring-0 checked:bg-primary checked:border-primary cursor-pointer transition-colors"
                  />
                  <span className="material-symbols-outlined absolute text-on-primary text-4 hidden peer-checked:block">
                    check
                  </span>
                </div>
                <span className="font-label-md text-label-md text-on-surface-variant group-hover:text-on-surface">
                  Remember me
                </span>
              </label>
              <button type="button" className="font-label-md text-label-md text-primary hover:underline transition-all">
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary hover:bg-surface-tint text-on-primary font-title-md text-title-md rounded-lg flex items-center justify-center gap-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-xl pt-lg border-t border-outline-variant flex flex-col items-center gap-md">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="w-full h-12 border border-outline-variant hover:bg-surface-container-low text-primary font-title-md text-title-md rounded-lg flex items-center justify-center transition-all"
            >
              Sign up
            </Link>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md overflow-hidden rounded-xl border border-outline-variant">
          <div className="relative h-24 md:h-32">
            <img
              alt="Tomato crop inspection"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC07gVWOG5QsgBkeogNBSnR9DDOyER4pEyVVU4-Hu17_WfgyqZnCUVI83xSwljWsJMacQx1eUKC9WX3Vfz-81yQ5MXbYhOL4EY6yPJdIgBfRrgbE_WRFETA_majuP2oDBsWJvCU72ql8nRnrx3K_Hpdm-j7mK8OvTV5rmJp2kdM6L8hPwmMTwekpfc_JhcvVLVIR6lmyZ_TTBo-UPfn-Z8ozp_xTk45biM6jG8RP4v1_AaeGj_At_J3m7iVEMMoh8DHOpvGNsNiRck"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-base">
              <span className="text-white font-label-md text-[10px] uppercase tracking-wider">
                Scientific Accuracy
              </span>
            </div>
          </div>
          <div className="relative h-24 md:h-32">
            <img
              alt="AgroLens App Interface"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXmL_JfvAEC7ho2NG4R6VPFbjXhHHGqFTaPR_Yfj2Wuxj34eDxn5YQoO_SsiHjG24L80lbGVDS3YtBD91tLG3EUzLCoMRdxgCCh6BkzLpx1btK5bFr2bnLXZUBMW1IPMfB9AcTqYVrMiv_NWCZR0MkhA_gT45IAM7FiMQUo8Isl5U42pkEkujDq_E6b_eIebBZ8ZHg0R8mwbyl6kbHPL42Zs76f0vi3Z914a5Qq8B2YEt5J-y9olC7TdDJJ8uo4g8qNtSh4MsLjKA"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-base">
              <span className="text-white font-label-md text-[10px] uppercase tracking-wider">
                Field Ready UI
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
