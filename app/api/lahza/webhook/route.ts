import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function extractOrderId(body: any, reference: string): string | null {
  // Preferred: the order id we sent as metadata.order_id when the session
  // was created (metadata may come back as a JSON string or an object,
  // depending on how Lahza echoes it).
  const rawMeta = body?.data?.metadata;
  const meta =
    typeof rawMeta === "string"
      ? (() => {
          try {
            return JSON.parse(rawMeta);
          } catch {
            return null;
          }
        })()
      : rawMeta;

  if (meta?.order_id) return String(meta.order_id);

  // Fallback: parse it out of the reference, format "NAPD_<orderId>_<ts>".
  // "_" is used as the separator (never "-") because order ids are UUIDs
  // and contain hyphens themselves.
  const parts = String(reference || "").split("_");
  if (parts.length >= 3 && parts[0] === "NAPD") return parts[1];

  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Log only what's needed to debug a failed payment — not the full
    // payload, which can include the customer's email/phone.
    console.log("Lahza webhook received:", {
      reference: body?.data?.reference,
      status: body?.data?.status,
    });

    const reference = body?.data?.reference;
    const status = body?.data?.status;

    if (!reference || status !== "success") {
      return NextResponse.json({ received: true });
    }

    const orderId = extractOrderId(body, reference);

    if (!orderId) {
      console.error("Lahza webhook: could not resolve order id from", reference);
      return NextResponse.json({ received: true });
    }

    // mark_order_paid only flips payment_status when payment_reference on
    // that order matches this exact reference (set at session-creation
    // time) — this is what stops the publicly-callable RPC from being used
    // to fraudulently mark an arbitrary order as paid.
    const { error } = await supabase.rpc("mark_order_paid", {
      p_order_id: orderId,
      p_reference: reference,
    });

    if (error) {
      console.error("mark_order_paid error:", error.message);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
