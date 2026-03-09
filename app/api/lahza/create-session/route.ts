import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);
    const email = String(body.email || "").trim();
    const mobile = String(body.mobile || "").trim();
    const reference = String(body.reference || "").trim();

    if (!amount || !email || !reference) {
      return NextResponse.json(
        { error: "amount, email, and reference are required" },
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