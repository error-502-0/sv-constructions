import { NextResponse } from 'next/server';

const BOT_TOKEN = "8853700596:AAGxqeMyz8U8mXUW3iEkfSUVnqTxC6tOz-E";
const CHAT_ID = "7445545521";

export async function POST(req: Request) {
  try {
    let message: string = "";
    let file: File | null = null;

    const contentType = req.headers.get("content-type") || "";
    
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      message = formData.get("message") as string;
      file = formData.get("file") as File | null;
    } else {
      const body = await req.json();
      message = body.message;
    }

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    let telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    let fetchOptions: RequestInit = {};

    if (file) {
      telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`;
      
      const telegramFormData = new FormData();
      telegramFormData.append("chat_id", CHAT_ID);
      telegramFormData.append("document", file);
      telegramFormData.append("caption", message);
      telegramFormData.append("parse_mode", "HTML");
      
      fetchOptions = {
        method: "POST",
        body: telegramFormData,
      };
    } else {
      fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      };
    }

    const response = await fetch(telegramUrl, fetchOptions);

    if (!response.ok) {
      const err = await response.text();
      console.error("Telegram API Error:", err);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
