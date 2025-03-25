// lib/gemni_api/mailService.ts
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL;
const EMAIL_PASS = process.env.EMAILPASSKEY;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error("Missing EMAIL or EMAILPASSKEY in environment variables");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

// Add a timeout wrapper
const withTimeout = (promise: Promise<any>, ms: number) => {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Email sending timed out")), ms)
  );
  return Promise.race([promise, timeout]);
};

export const sendEmail = async (
  email: string,
  name: string,
  message: string,
  timestamp: string
): Promise<void> => {
  console.log("Attempting to send email with:", {
    email,
    name,
    message,
    timestamp,
  });

  try {
    const mailOptions = {
      from: `"VoiceMD Feedback" <${EMAIL_USER}>`,
      to: "nitin@voicemd.tech",
      subject: "User Feedback from VoiceMD",
      text: `Name: ${name}\nEmail: ${email}\nTimestamp: ${timestamp}\nMessage: ${message}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #1a73e8;">VoiceMD User Feedback</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Timestamp:</strong> ${timestamp}</p>
          <p><strong>Message:</strong> ${message}</p>
        </div>
      `,
    };

    const info = await withTimeout(transporter.sendMail(mailOptions), 10000); // 10s timeout
    console.log("Email sent successfully, message ID:", info.messageId);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error; // Let the API handle the error
  }
};
