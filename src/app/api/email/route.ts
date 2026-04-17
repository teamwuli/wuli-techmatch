import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { contact_id, to, subject, html, sequence_number, recipient_title, message_variant } = await req.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Missing required fields: to, subject, html" }, { status: 400 });
    }

    // Inject open-tracking pixel before closing </body> or at end of HTML
    const trackingPixel = contact_id
      ? `<img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://wuli-techmatch-app.vercel.app'}/api/pixel?contact_id=${contact_id}&seq=${sequence_number || 1}" width="1" height="1" style="display:none" alt="" />`
      : "";
    const htmlWithTracking = html.includes("</body>")
      ? html.replace("</body>", `${trackingPixel}</body>`)
      : `${html}${trackingPixel}`;

    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "WULI TechMatch <noreply@wuli.ai>",
      to: [to],
      subject,
      html: htmlWithTracking,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Log the send event and update contact record
    if (contact_id) {
      const emailField = `email${sequence_number || 1}_sent`;
      await Promise.all([
        supabase.from("events").insert({
          contact_id,
          event_type: "email_sent",
          metadata: {
            resend_id: data?.id,
            sequence_number: sequence_number || 1,
            subject,
            to,
            recipient_title: recipient_title || null,
            message_variant: message_variant || null,
            sent_at_hour: new Date().getHours(),
            sent_at_day: new Date().toLocaleDateString("en-US", { weekday: "long" }),
            sent_at_iso: new Date().toISOString(),
          },
        }),
        supabase
          .from("contacts")
          .update({ [emailField]: true })
          .eq("id", contact_id),
      ]);
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json({ error: "Email service error" }, { status: 500 });
  }
}
