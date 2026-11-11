import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import logo from "../assets/images/liftly-logo.png";

function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("Verifying your email address...");

  useEffect(() => {
    const verifyEmailToken = async () => {
      try {
        const res = await api.get(`/users/verify-email/${token}`);
        setStatus("success");
        setMessage(res.data.message || "Email verified successfully!");

        // Skicka vidare till inloggning efter 3 sekunder
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setStatus("error");
        setMessage(
          err.response?.data?.message || "Verification failed or token has expired."
        );
      }
    };

    verifyEmailToken();
  }, [token, navigate]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-[#0D0D0E] px-4 font-sans text-white">
      <div className="w-full max-w-xs flex flex-col items-center">

        {/* Logo & Rubrik Container */}
        <div className="mb-8 flex flex-col items-center text-center">
          <img src={logo} alt="Liftly logo" className="h-9 w-auto mb-3 object-contain" />
          <h1 className="text-base font-semibold text-white tracking-wide mb-1">
            Email Verification
          </h1>
        </div>

        {/* Status Box */}
        <div className="w-full text-center">
          {status === "verifying" && (
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-gray-400">{message}</p>
            </div>
          )}

          {status === "success" && (
            <p className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-3 rounded border border-emerald-500/20 w-full text-center">
              {message} Redirecting to login...
            </p>
          )}

          {status === "error" && (
            <p className="text-xs font-semibold text-red-500 bg-red-500/10 px-3 py-3 rounded border border-red-500/20 w-full text-center">
              {message}
            </p>
          )}
        </div>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-xs text-gray-400 hover:text-white font-medium transition-colors"
          >
            ← Back to Login
          </Link>
        </div>

      </div>
    </section>
  );
}

export default VerifyEmailPage;