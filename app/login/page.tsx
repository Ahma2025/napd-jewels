"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const PRIMARY = "#123E38";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMsg(error.message);
      return;
    }

    const userId = data.user?.id;
    if (!userId) {
      setLoading(false);
      setErrorMsg("Login succeeded but user id is missing.");
      return;
    }

    // Fetch role from profiles to route owner vs customer
    const { data: profile, error: pErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    setLoading(false);

    if (pErr) {
      setErrorMsg(pErr.message);
      return;
    }

    if (profile?.role === "owner") {
      router.push("/owner-dashboard");
    } else {
      router.push("/");
    }
  }

  return (
    <main className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-white px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif tracking-[0.2em] text-black">
            LOGIN
          </h1>
          <p className="text-sm text-black/60 mt-2">
            Welcome back to NAPD Jewels
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white uppercase tracking-[0.25em] text-sm transition disabled:opacity-60"
              style={{ backgroundColor: PRIMARY }}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="text-center text-sm text-black/60">
              Don’t have an account?{" "}
              <Link
                href="/register"
                className="underline underline-offset-4 hover:text-[#123E38]"
              >
                Create one
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}