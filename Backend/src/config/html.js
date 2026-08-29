import { config } from "./config.js"

export const getOtpHtml = ({ email, otp, appName = "MeriJodi" }) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${appName} Verification Code</title>
<style>
  body { margin: 0; padding: 0; background: #FFF5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; }
  .wrapper { width: 100%; padding: 40px 0; }
  .container { width: 90%; max-width: 540px; background: #FFFFFF; border-radius: 16px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(237, 84, 99, 0.08); border: 1px solid #FFE4E6; }
  .header { background: linear-gradient(135deg, #ED5463 0%, #D4384B 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
  .brand { font-size: 26px; font-weight: 800; letter-spacing: 0.5px; margin: 0; }
  .tagline { font-size: 13px; color: #FFE4E6; margin-top: 4px; }
  .content { padding: 36px 32px; text-align: center; }
  .title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }
  .subtitle { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 24px 0; }
  .otp-box { background: #FFF1F2; border: 2px dashed #FDA4AF; border-radius: 12px; padding: 18px 24px; display: inline-block; margin: 0 auto 24px auto; }
  .otp { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #E11D48; font-family: 'Courier New', monospace; }
  .note { font-size: 13px; color: #9CA3AF; line-height: 1.6; margin: 0 0 8px 0; }
  .footer { background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #F3F4F6; font-size: 12px; color: #9CA3AF; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      <h1 class="brand">${appName}</h1>
      <div class="tagline">Where Beautiful Stories Begin</div>
    </div>
    <div class="content">
      <h2 class="title">Login Verification Code</h2>
      <p class="subtitle">Hi there! Use the secure 6-digit verification code below to sign in to your <strong>${appName}</strong> account (<strong>${email}</strong>).</p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
      </div>
      <p class="note">This code will expire in <strong>5 minutes</strong>.</p>
      <p class="note">If you did not request this code, please ignore this email.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${appName}. All rights reserved.
    </div>
  </div>
</div>
</body>
</html>`
}

export const getVerifyEmailHtml = ({ email, token, appName = "MeriJodi" }) => {
    const baseUrl = config.frontendUrl || config.frontendDomain || "http://localhost:5173"
    const verifyUrl = `${baseUrl.replace(/\/+$/, "")}/verify-email/${encodeURIComponent(token)}`

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Verify your ${appName} Account</title>
<style>
  body { margin: 0; padding: 0; background: #FFF5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1F2937; }
  .wrapper { width: 100%; padding: 40px 0; }
  .container { width: 90%; max-width: 540px; background: #FFFFFF; border-radius: 16px; margin: 0 auto; overflow: hidden; box-shadow: 0 10px 25px rgba(237, 84, 99, 0.08); border: 1px solid #FFE4E6; }
  .header { background: linear-gradient(135deg, #ED5463 0%, #D4384B 100%); padding: 32px 24px; text-align: center; color: #FFFFFF; }
  .brand { font-size: 26px; font-weight: 800; letter-spacing: 0.5px; margin: 0; }
  .tagline { font-size: 13px; color: #FFE4E6; margin-top: 4px; }
  .content { padding: 36px 32px; text-align: center; }
  .title { font-size: 22px; font-weight: 700; color: #111827; margin: 0 0 12px 0; }
  .subtitle { font-size: 15px; line-height: 1.6; color: #4B5563; margin: 0 0 28px 0; }
  .btn { display: inline-block; background: #ED5463; color: #FFFFFF !important; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 12px rgba(237, 84, 99, 0.3); }
  .note { font-size: 13px; color: #9CA3AF; line-height: 1.6; margin-top: 24px; }
  .link-box { word-break: break-all; color: #ED5463; font-size: 12px; margin-top: 12px; }
  .footer { background: #FAFAFA; padding: 20px; text-align: center; border-top: 1px solid #F3F4F6; font-size: 12px; color: #9CA3AF; }
</style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <div class="header">
      <h1 class="brand">${appName}</h1>
      <div class="tagline">Where Beautiful Stories Begin</div>
    </div>
    <div class="content">
      <h2 class="title">Verify Your Email Address</h2>
      <p class="subtitle">Welcome to <strong>${appName}</strong>! Please click the button below to confirm your email (<strong>${email}</strong>) and activate your matchmaking profile.</p>
      <div>
        <a class="btn" href="${verifyUrl}" target="_blank" rel="noopener">Verify My Account</a>
      </div>
      <p class="note">This verification link is valid for <strong>5 minutes</strong>.</p>
      <p class="note">If the button does not work, copy and paste this URL into your browser:</p>
      <div class="link-box"><a href="${verifyUrl}" style="color: #ED5463;">${verifyUrl}</a></div>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${appName}. All rights reserved.
    </div>
  </div>
</div>
</body>
</html>`
}

export const getWelcomeHtml = ({ name, email, appName = "MeriJodi" }) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Welcome to ${appName}</title>
<style>
  body { margin: 0; padding: 0; background: #FFF5F5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 540px; background: #FFFFFF; border-radius: 16px; margin: 30px auto; overflow: hidden; border: 1px solid #FFE4E6; }
  .header { background: #ED5463; padding: 28px; text-align: center; color: white; }
  .content { padding: 32px; text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>${appName}</h1></div>
    <div class="content">
      <h2>Welcome, ${name || "Friend"}!</h2>
      <p>Your profile is ready. Start discovering verified matches today.</p>
    </div>
  </div>
</body>
</html>`
}
