// pages/api/send-email.ts
import { sendEmail } from "@/lib/gemni_api/mailService";
import { NextRequest, NextResponse } from "next/server";

interface FormData {
  name: string;
  email: string;
  message: string;
  timestamp?: string;
}

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export async function POST(req: NextRequest) {
  try {
    const { name, email, message, timestamp } = (await req.json()) as FormData;

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          message:
            "Missing required fields: name, email, and message are required",
        },
        { status: 400 }
      );
    }
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Invalid email format" },
        { status: 400 }
      );
    }

    await sendEmail(
      email,
      name,
      message,
      timestamp || new Date().toISOString()
    );

    return NextResponse.json(
      { message: "Form submitted successfully" },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("API Error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
