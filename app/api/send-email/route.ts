import nodemailer from "nodemailer";
import { readFileSync } from "fs";
import { join } from "path";

export async function POST(req: Request) {
  const formData = await req.formData();
  const email = formData.get("email") as string | null;
  const company_name = formData.get("company_name") as string | null;
  const role = formData.get("role") as string | null;
  const subject = formData.get("subject") as string | null;
  const cover_letter = formData.get("cover_letter") as string | null;
  const resumeFile = formData.get("resume") as File | null;

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

  let resumeBuffer: Buffer;
  let filename = "resume.pdf";

  if (resumeFile) {
    const arrayBuffer = await resumeFile.arrayBuffer();
    resumeBuffer = Buffer.from(arrayBuffer);
    filename = resumeFile.name;
  } else {
    resumeBuffer = readFileSync(join(process.cwd(), "public", "resume.pdf"));
  }

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: email,
    subject: subject || `Application for ${role} at ${company_name}`,
    text: cover_letter,
    attachments: [
      {
        filename: filename,
        content: resumeBuffer,
        contentType: "application/pdf",
      },
    ],
  });

  return Response.json({ success: true });
}
