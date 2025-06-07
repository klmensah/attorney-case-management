import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@lawfirm.com",
      to,
      subject,
      html,
    })
    return { success: true }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

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
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1f2937;">Case Reminder</h2>
      <p>Dear ${name},</p>
      <p>This is a reminder for the following case:</p>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0; color: #374151;">${reminder.title}</h3>
        <p><strong>Case:</strong> ${reminder.case_subject}</p>
        <p><strong>Suit Number:</strong> ${reminder.suit_number}</p>
        <p><strong>Description:</strong> ${reminder.description}</p>
      </div>
      <p>Please take the necessary action.</p>
      <p>Best regards,<br>Case Management System</p>
    </div>
  `

  return sendEmail({
    to: email,
    subject: `Case Reminder: ${reminder.title}`,
    html,
  })
}
