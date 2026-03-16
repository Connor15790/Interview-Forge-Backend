"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendCertificateEmail = sendCertificateEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});
async function sendCertificateEmail({ toEmail, userName, courseTitle, courseTopic, completedAt, }) {
    const formattedDate = completedAt.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Certificate of Completion</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f9fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <!-- Wrapper -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fb;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;border:1px solid #e4e7ec;overflow:hidden;max-width:600px;width:100%;">

          <!-- Top accent bar -->
          <tr>
            <td style="background:linear-gradient(90deg,#6366f1,#4f46e5);height:4px;"></td>
          </tr>

          <!-- Header -->
          <tr>
            <td align="center" style="padding:40px 48px 32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background-color:#6366f1;width:28px;height:28px;border-radius:8px;"></td>
                  <td style="padding-left:10px;font-size:18px;font-weight:700;color:#0f1117;letter-spacing:-0.01em;">CourseForge</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Certificate body -->
          <tr>
            <td align="center" style="padding:0 48px 40px;">

              <!-- Certificate card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fb;border:1px solid #e4e7ec;border-radius:12px;padding:40px;text-align:center;">
                <tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:#6366f1;">Certificate of Completion</p>
                    <p style="margin:0 0 24px;font-size:13px;color:#4b5563;">This certifies that</p>

                    <p style="margin:0 0 4px;font-size:28px;font-weight:700;color:#0f1117;letter-spacing:-0.02em;">${userName}</p>
                    <div style="width:60px;height:3px;background:linear-gradient(90deg,#6366f1,#4f46e5);margin:12px auto 24px;border-radius:2px;"></div>

                    <p style="margin:0 0 8px;font-size:13px;color:#4b5563;">has successfully completed</p>
                    <p style="margin:0 0 24px;font-size:18px;font-weight:700;color:#0f1117;line-height:1.4;">${courseTitle}</p>

                    <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                      <tr>
                        <td style="background-color:#eef2ff;border-radius:9999px;padding:4px 14px;">
                          <p style="margin:0;font-size:12px;font-weight:600;color:#6366f1;">${courseTopic}</p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;font-size:12px;color:#9ca3af;">Completed on ${formattedDate}</p>
                  </td>
                </tr>
              </table>

              <!-- Message -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td>
                    <p style="margin:0 0 12px;font-size:15px;color:#0f1117;font-weight:600;">Congratulations, ${userName.split(" ")[0]}!</p>
                    <p style="margin:0 0 12px;font-size:14px;color:#4b5563;line-height:1.6;">
                      You've completed all lessons and quizzes in <strong>${courseTitle}</strong>.
                      You're one step closer to acing your next interview.
                    </p>
                    <p style="margin:0;font-size:14px;color:#4b5563;line-height:1.6;">
                      Keep building on this momentum — generate your next course and continue your prep.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" style="margin-top:32px;">
                <tr>
                  <td align="center" style="background-color:#6366f1;border-radius:8px;">
                    <a href="${process.env.FRONTEND_URL}/dashboard"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;">
                      Continue Learning →
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #e4e7ec;padding:24px 48px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                You received this email because you completed a course on CourseForge.<br/>
                © ${new Date().getFullYear()} CourseForge. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `;
    await transporter.sendMail({
        from: `"CourseForge" <${process.env.GMAIL_USER}>`,
        to: toEmail,
        subject: `Certificate of Completion — ${courseTitle}`,
        html,
    });
}
