"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-serif">
        Payment successful... Redirecting
      </h1>
    </div>
  );
}