import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(req: Request) {
  const { email, company_name, role, cover_letter } = await req.json();

  if (!email || !cover_letter) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const resumeBuffer = readFileSync(join(process.cwd(), "public", "resume.pdf"));

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: `Application for ${role} at ${company_name}`,
    text: cover_letter,
    attachments: [
      {
        filename: "resume.pdf",
        content: resumeBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return Response.json({ success: true });
}
