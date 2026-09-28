"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Tells whether the currently signed-in user is the store owner/admin.
 * Regular customers (and signed-out visitors) get isOwner=false.
 *
 * Used to keep out-of-stock (quantity <= 0) products hidden from
 * regular customers while still letting the owner see and edit them.
 */
export function useIsOwner() {
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user?.id ?? null;

      if (!uid) {
        if (mounted) {
          setIsOwner(false);
          setLoading(false);
        }
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (!mounted) return;

      setIsOwner(!error && profile?.role === "owner");
      setLoading(false);
    }

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      check();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { isOwner, loading };
}
