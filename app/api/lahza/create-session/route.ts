import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = Number(body.amount);
    const email = body.email;
    const mobile = body.mobile;
    const reference = body.reference;

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
        amount: amount, 
        currency: "ILS",
        email: email,
        mobile: mobile,
        reference: reference,
        callback_url: "http://localhost:3000/payment-success",
        metadata: {
          source: "napd-jewels",
        },
      }),
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Lahza error:", error);
    return NextResponse.json(
      { error: "Payment initialization failed" },
      { status: 500 }
    );
  }
}