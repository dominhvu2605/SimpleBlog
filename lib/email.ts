import { createTransport } from 'nodemailer';

const transporter = createTransport({
  host:   process.env.SMTP_HOST ?? 'smtp.gmail.com',
  port:   Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const link   = `${appUrl}/verify-email?token=${token}`;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to:      email,
    subject: 'Xác nhận email — MeoCuti Blog',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1A1A">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Xác nhận địa chỉ email</h2>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px">
          Bạn vừa đăng ký tài khoản trên <strong>MeoCuti Blog</strong>.
          Nhấp vào nút bên dưới để hoàn tất đăng ký.
        </p>
        <a href="${link}"
           style="display:inline-block;padding:10px 24px;background:#1A1A1A;color:#fff;
                  text-decoration:none;border-radius:6px;font-size:14px;font-weight:500">
          Xác nhận email
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
          Liên kết có hiệu lực trong 24 giờ.
          Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
        </p>
        <p style="color:#D1D5DB;font-size:11px">
          Hoặc sao chép đường dẫn: ${link}
        </p>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<void> {
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000';
  const link   = `${appUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from:    process.env.SMTP_FROM ?? process.env.SMTP_USER,
    to:      email,
    subject: 'Đặt lại mật khẩu — MeoCuti Blog',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;color:#1A1A1A">
        <h2 style="font-size:20px;font-weight:600;margin-bottom:8px">Đặt lại mật khẩu</h2>
        <p style="color:#6B7280;font-size:14px;margin-bottom:24px">
          Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản <strong>MeoCuti Blog</strong>.
          Nhấp vào nút bên dưới để tiếp tục.
        </p>
        <a href="${link}"
           style="display:inline-block;padding:10px 24px;background:#1A1A1A;color:#fff;
                  text-decoration:none;border-radius:6px;font-size:14px;font-weight:500">
          Đặt lại mật khẩu
        </a>
        <p style="color:#9CA3AF;font-size:12px;margin-top:24px">
          Liên kết có hiệu lực trong 1 giờ.
          Nếu bạn không thực hiện yêu cầu này, hãy bỏ qua email này.
        </p>
        <p style="color:#D1D5DB;font-size:11px">
          Hoặc sao chép đường dẫn: ${link}
        </p>
      </div>
    `,
  });
}
