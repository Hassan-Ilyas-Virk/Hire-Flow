import nodemailer from "nodemailer";

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

  const resumeUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://" + process.env.VERCEL_URL}/resume.pdf`;
  const res = await fetch(resumeUrl);
  const resumeBuffer = Buffer.from(await res.arrayBuffer());

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
