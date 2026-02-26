"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PRIMARY = "#123E38";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }, // راح تنزل تلقائي على profiles عبر trigger
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
      return;
    }

    // غالباً Supabase بده email confirmation حسب الإعدادات
    router.push("/login");
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif tracking-[0.2em] text-black">
            REGISTER
          </h1>
          <p className="text-sm text-black/60 mt-2">
            Create your account to start shopping
          </p>
        </div>

        <div className="border border-black/10 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="text-sm rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-black/60 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#123E38] focus:ring-2 focus:ring-[#123E38]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-black/60 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#123E38] focus:ring-2 focus:ring-[#123E38]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-black/60 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#123E38] focus:ring-2 focus:ring-[#123E38]/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-[0.25em] text-black/60 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#123E38] focus:ring-2 focus:ring-[#123E38]/20 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white uppercase tracking-[0.25em] text-sm transition disabled:opacity-60"
              style={{ backgroundColor: PRIMARY }}
            >
              {loading ? "Creating..." : "Create Account"}
            </button>

            <div className="text-center text-sm text-black/60">
              Already have an account?{" "}
              <Link
                href="/login"
                className="underline underline-offset-4 hover:text-[#123E38]"
              >
                Login
              </Link>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-black/40">
          By creating an account, you agree to our Terms & Privacy Policy.
        </p>
      </div>
    </main>
  );
}