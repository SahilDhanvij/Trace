"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "join" ? "join" : "login";

  const [mode, setMode] = useState<"login" | "join">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "join") {
        const res = await api.register(name.trim(), email.trim(), password);
        api.setAccessToken(res.accessToken);
        toast.success("Welcome to Trace!");
      } else {
        const res = await api.loginWithEmail(email.trim(), password);
        api.setAccessToken(res.accessToken);
        toast.success("Welcome back!");
      }
      router.push("/map");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.loginWithGoogle(credentialResponse.credential);
      api.setAccessToken(res.accessToken);
      router.push("/map");
    } catch {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  const switchMode = () => {
    setMode(mode === "login" ? "join" : "login");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col">
      <div className="grain" />

      {/* Back to landing */}
      <nav className="px-6 py-8 flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-xs uppercase tracking-[0.15em]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
        <Link href="/" className="text-xl font-serif italic tracking-tighter">
          Trace
        </Link>
        <div className="w-14" />
      </nav>

      {/* Auth form */}
      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-serif italic mb-3">
              {mode === "login" ? "Welcome back." : "Begin your journey."}
            </h1>
            <p className="text-white/30 text-sm">
              {mode === "login"
                ? "Sign in to continue exploring"
                : "Create an account to start mapping your travels"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "join" && (
              <div>
                <label className="block text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37]/40 transition-colors"
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37]/40 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-[0.2em] text-white/30 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "join" ? "Min 8 characters" : "••••••••"}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#D4AF37]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#D4AF37] text-black font-bold text-xs uppercase tracking-[0.15em] rounded-lg hover:bg-[#c9a432] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? "Please wait..."
                : mode === "login"
                  ? "Sign in"
                  : "Create account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/20">
              or
            </span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          {/* Google OAuth */}
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
          >
            <div className="flex justify-center [&_div]:!bg-transparent">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error("Google sign-in failed")}
                size="large"
                text={mode === "login" ? "signin_with" : "signup_with"}
                shape="rectangular"
                theme="filled_black"
                width="350"
              />
            </div>
          </GoogleOAuthProvider>

          {/* Mode switch */}
          <p className="text-center mt-8 text-sm text-white/30">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={switchMode}
                  className="text-[#D4AF37] hover:text-[#e5c44a] transition-colors font-medium"
                >
                  Join
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={switchMode}
                  className="text-[#D4AF37] hover:text-[#e5c44a] transition-colors font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
          <div className="text-white/20 text-sm">Loading...</div>
        </div>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
