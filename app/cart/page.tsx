"use client";

import Link from "next/link";
import { useCart } from "../context/CartContext";
const PRIMARY = "#123E38";
export default function CartPage() {
  const { cart, removeFromCart, increase, decrease, subtotal } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-10 text-center">
        <h1 className="text-3xl font-serif mb-4">Your Cart</h1>
        <p className="text-black/60">Your cart is empty.</p>

        <Link
          href="/"
          className="inline-block mt-6 px-6 py-3 rounded-full border border-black/15 hover:border-black/30 transition"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-end justify-between gap-4 mb-6">
        <h1 className="text-3xl font-serif">Your Cart</h1>
        <Link
          href="/"
          className="text-sm uppercase tracking-wide text-black/60 hover:text-black"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="border border-black/10 rounded-2xl overflow-hidden">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-5 p-5 border-b border-black/10 last:border-b-0"
          >
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/5 shrink-0">
              {/* لو صورك من next/image بنبدلها لاحقاً */}
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="font-medium">{item.name}</div>
              <div className="text-sm text-black/60 mt-1">₪ {item.price}</div>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => decrease(item.id)}
                className="w-9 h-9 rounded-full border border-black/15 hover:border-black/30 transition"
              >
                -
              </button>

              <div className="w-10 text-center">{item.quantity}</div>

              <button
                onClick={() => increase(item.id)}
                className="w-9 h-9 rounded-full border border-black/15 hover:border-black/30 transition"
              >
                +
              </button>
            </div>

            {/* Total per item */}
            <div className="w-24 text-right font-medium">
              ₪ {item.price * item.quantity}
            </div>

            {/* Remove */}
            <button
              onClick={() => removeFromCart(item.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="text-black/70">
          Subtotal:{" "}
          <span className="font-semibold text-black">₪ {subtotal}</span>
        </div>

        <Link
          href="/checkout"
          className="inline-flex items-center justify-center px-8 py-3 rounded-full text-white uppercase tracking-wide"
          style={{ backgroundColor: PRIMARY }}
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}