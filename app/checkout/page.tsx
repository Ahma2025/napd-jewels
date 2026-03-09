"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";
import { supabase } from "@/lib/supabase";

const PRIMARY = "#123E38";

type DeliveryArea = "West Bank" | "Jerusalem" | "Inside";
type PaymentMethod = "cod" | "card";

const SHIPPING: Record<DeliveryArea, number> = {
  "West Bank": 20,
  Jerusalem: 30,
  Inside: 60,
};

function formatMoney(n: number) {
  return Number(n || 0).toFixed(2);
}

function extractLahzaUrl(data: any) {
  return (
    data?.payment_url ||
    data?.data?.authorization_url ||
    data?.data?.checkout_url ||
    data?.data?.url ||
    data?.authorization_url ||
    data?.checkout_url ||
    data?.url ||
    null
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, subtotal, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [cityName, setCityName] = useState("");
  const [deliveryArea, setDeliveryArea] =
    useState<DeliveryArea>("West Bank");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const shipping = SHIPPING[deliveryArea];

  const total = useMemo(() => {
    return subtotal + shipping;
  }, [subtotal, shipping]);

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-serif mb-3">Checkout</h1>
        <p className="text-black/60">Your cart is empty.</p>
        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-full border border-black/15 hover:border-black/30 transition"
        >
          Go Shopping
        </Link>
      </div>
    );
  }

  async function handleConfirm() {
    setErrorMsg(null);

    const name = fullName.trim();
    const mail = email.trim();
    const city = cityName.trim();
    const addr = address.trim();
    const phone = mobile.trim();

    if (!name || !city || !addr || !phone) {
      setErrorMsg("Please fill all required fields.");
      return;
    }

    if (paymentMethod === "card" && !mail) {
      setErrorMsg("Please enter your email for card payment.");
      return;
    }

    try {
      setSubmitting(true);

      const itemsPayload = cart.map((item: any) => ({
        product_id: item.id,
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        line_total: Number(item.price) * Number(item.quantity),
        image_url: item.image ?? null,
      }));

      const paymentMethodLabel =
        paymentMethod === "cod" ? "Cash on Delivery" : "Card Payment";

      const notesLines = [
        `Delivery Area: ${deliveryArea}`,
        `Payment Method: ${paymentMethodLabel}`,
        mail ? `Email: ${mail}` : null,
      ].filter(Boolean);

      const { data: orderId, error } = await supabase.rpc(
        "place_order_and_decrease_stock",
        {
          p_customer_name: name,
          p_customer_phone: phone,
          p_city: city,
          p_address: addr,
          p_subtotal: subtotal,
          p_shipping_fee: shipping,
          p_total: total,
          p_notes: notesLines.join(" | "),
          p_items: itemsPayload,
        }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (paymentMethod === "cod") {
        setToast("Your order has been placed successfully");
        clearCart();

        setTimeout(() => {
          router.push("/");
        }, 1200);

        return;
      }

      const amountInAgorot = Math.round(total * 100);
      const reference = `NAPD-${orderId}-${Date.now()}`;

      const res = await fetch("/api/lahza/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInAgorot,
          email: mail,
          mobile: phone,
          reference,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Lahza error response:", data);
        throw new Error(data?.error || "Failed to initialize card payment.");
      }

      const paymentUrl = extractLahzaUrl(data);

      if (!paymentUrl) {
        console.error("Lahza response:", data);
        throw new Error(
          "Payment link was not returned from Lahza. Please try again."
        );
      }

      clearCart();
      window.location.href = paymentUrl;
    } catch (e: any) {
      setErrorMsg(
        e?.message ||
          "Some items may be out of stock or payment could not be started. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {toast ? (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999]">
          <div className="rounded-full bg-black text-white px-5 py-3 text-sm shadow-lg">
            {toast}
          </div>
        </div>
      ) : null}

      <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-black/10 rounded-2xl p-6">
          <h1 className="text-3xl font-serif mb-6">Checkout</h1>

          <div className="space-y-4">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full border border-black/15 rounded-xl p-3"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full border border-black/15 rounded-xl p-3"
            />

            <input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="City Name"
              className="w-full border border-black/15 rounded-xl p-3"
            />

            <select
              value={deliveryArea}
              onChange={(e) =>
                setDeliveryArea(e.target.value as DeliveryArea)
              }
              className="w-full border border-black/15 rounded-xl p-3 bg-white"
            >
              <option value="West Bank">West Bank (+20 ₪)</option>
              <option value="Jerusalem">Jerusalem (+30 ₪)</option>
              <option value="Inside">Inside (+60 ₪)</option>
            </select>

            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Detailed Address"
              className="w-full border border-black/15 rounded-xl p-3"
            />

            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="Mobile Number"
              className="w-full border border-black/15 rounded-xl p-3"
            />

            <div className="border border-black/10 rounded-2xl p-4">
              <h3 className="text-sm font-medium mb-3">Payment Method</h3>

              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span>Cash on Delivery</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                />
                <span>Pay with Card</span>
              </label>
            </div>

            {errorMsg && (
              <div className="text-sm text-red-600">{errorMsg}</div>
            )}
          </div>

          <button
            className="mt-6 w-full py-3 rounded-xl text-white uppercase disabled:opacity-60"
            style={{ backgroundColor: PRIMARY }}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting
              ? "Submitting..."
              : paymentMethod === "cod"
              ? "Confirm Order"
              : "Continue to Card Payment"}
          </button>

          <Link
            href="/cart"
            className="block text-center mt-4 text-sm text-black/60"
          >
            Back to Cart
          </Link>
        </div>

        <div className="border border-black/10 rounded-2xl p-6 h-fit">
          <h2 className="text-xl font-serif mb-4">Order Summary</h2>

          {cart.map((item: any) => (
            <div
              key={item.id}
              className="flex justify-between mb-3 text-sm"
            >
              <div>
                {item.name} × {item.quantity}
              </div>
              <div>
                ₪ {formatMoney(Number(item.price) * Number(item.quantity))}
              </div>
            </div>
          ))}

          <div className="border-t pt-4 mt-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₪ {formatMoney(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span>Shipping</span>
              <span>₪ {formatMoney(shipping)}</span>
            </div>

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>₪ {formatMoney(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}