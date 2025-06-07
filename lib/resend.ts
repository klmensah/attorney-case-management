import { Resend } from "resend"

// Initialize the Resend client with API key
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendReminderEmail(
  email: string,
  name: string,
  reminder: {
    title: string
    description: string
    case_subject: string
    suit_number: string
  },
) {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "Case Management <notifications@casemanagement.com>",
      to: email,
      subject: `Case Reminder: ${reminder.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1f2937;">Case Reminder</h2>
          <p>Dear ${name},</p>
          <p>This is a reminder for the following case:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #374151;">${reminder.title}</h3>
            <p><strong>Case:</strong> ${reminder.case_subject}</p>
            <p><strong>Suit Number:</strong> ${reminder.suit_number}</p>
            <p><strong>Description:</strong> ${reminder.description || "No description provided"}</p>
          </div>
          <p>Please take the necessary action.</p>
          <p>Best regards,<br>Case Management System</p>
        </div>
      `,
    })

    if (error) {
      console.error("Error sending email:", error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}
