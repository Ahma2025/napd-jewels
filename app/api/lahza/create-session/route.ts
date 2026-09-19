import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);
    const email = String(body.email || "").trim();
    const mobile = String(body.mobile || "").trim();
    const reference = String(body.reference || "").trim();
    const orderId = String(body.orderId || "").trim();

    if (!amount || !email || !reference || !orderId) {
      return NextResponse.json(
        { error: "amount, email, reference, and orderId are required" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.lahza.io/transaction/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.LAHZA_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: String(amount),
        currency: "ILS",
        email,
        mobile,
        reference,
        callback_url: "https://napd-jewels.vercel.app/payment-success",
        metadata: JSON.stringify({
          source: "napd-jewels",
          payment_method: "card",
          order_id: orderId,
        }),
      }),
    });

    const data = await response.json();

    const paymentUrl =
      data?.data?.authorization_url ||
      data?.authorization_url ||
      null;

    if (!response.ok || !paymentUrl) {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error ||
            "Lahza did not return authorization_url",
          lahza: data,
        },
        { status: 400 }
      );
    }

    // Record the reference we issued for this order so the webhook can only
    // mark it "paid" if it comes back with the exact same reference — this
    // stops the (publicly callable) mark_order_paid RPC from being used to
    // fraudulently flag an arbitrary order as paid.
    const { error: refError } = await supabase.rpc(
      "set_order_payment_reference",
      { p_order_id: orderId, p_reference: reference }
    );

    if (refError) {
      console.error("set_order_payment_reference error:", refError.message);
    }

    return NextResponse.json({
      status: true,
      payment_url: paymentUrl,
      reference: data?.data?.reference || reference,
      raw: data,
    });
  } catch (error: any) {
    console.error("Lahza create-session error:", error);
    return NextResponse.json(
      { error: error?.message || "Payment initialization failed" },
      { status: 500 }
    );
  }
}
