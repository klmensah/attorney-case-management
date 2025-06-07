import { NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { sendReminderEmail } from "@/lib/resend"

export async function GET() {
  try {
    // Get due reminders that haven't been sent
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select(`
        *,
        user_email:users(email, name),
        case_info:cases(subject, suit_number)
      `)
      .lte("reminder_date", new Date().toISOString())
      .eq("is_sent", false)
      .eq("is_completed", false)

    if (error) {
      throw error
    }

    let sentCount = 0

    for (const reminder of reminders || []) {
      if (reminder.user_email && reminder.case_info) {
        await sendReminderEmail(reminder.user_email.email, reminder.user_email.name, {
          title: reminder.title,
          description: reminder.description,
          case_subject: reminder.case_info.subject,
          suit_number: reminder.case_info.suit_number,
        })

        // Mark as sent
        await supabase.from("reminders").update({ is_sent: true }).eq("id", reminder.id)

        sentCount++
      }
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
    })
  } catch (error) {
    console.error("Send reminders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
