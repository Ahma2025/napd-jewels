import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Lahza webhook:", body);

    const reference = body?.data?.reference;
    const status = body?.data?.status;

    if (!reference) {
      return NextResponse.json({ received: true });
    }

    if (status === "success") {
      const orderId = reference.split("-")[1];

      await supabase
        .from("orders")
        .update({ payment_status: "paid" })
        .eq("id", orderId);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}