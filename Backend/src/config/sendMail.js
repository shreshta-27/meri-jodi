import nodemailer from "nodemailer"
import { config } from "./config.js"

let transporter = null

const getTransporter = () => {
    if (transporter) return transporter

    if (config.smtp.user && config.smtp.pass) {
        transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: config.smtp.port,
            secure: config.smtp.port === 465,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.pass,
            },
            connectionTimeout: 4000,
            greetingTimeout: 4000,
            socketTimeout: 5000,
        })
    } else {
        // Dev fallback simulated transporter
        transporter = {
            sendMail: async (mailOptions) => {
                return { messageId: "simulated-" + Date.now() }
            },
        }
    }

    return transporter
}

export const sendMail = async ({ email, subject, html, text }) => {
    // Always print prominent notification in console for testing convenience
    console.log("\n================ [EMAIL DISPATCH] ================")
    console.log(`To:      ${email}`)
    console.log(`Subject: ${subject}`)
    if (text) {
        console.log(`Body:    ${text}`)
    }
    console.log("==================================================\n")

    try {
        const client = getTransporter()
        const fromAddress = config.smtp.user
            ? `"${config.appName}" <${config.smtp.user}>`
            : `"${config.appName}" <no-reply@merijodi.com>`

        const result = await client.sendMail({
            from: fromAddress,
            to: email,
            subject,
            html,
            text,
        })
        return result
    } catch (error) {
        console.warn(`[Live SMTP Notice] Could not deliver live email to ${email} (${error.message}).`)
        return { error: error.message }
    }
}

export default sendMail
