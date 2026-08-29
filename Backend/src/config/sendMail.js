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
        })
    } else {
        // Dev fallback simulated transporter
        transporter = {
            sendMail: async (mailOptions) => {
                console.log("\n================ [EMAIL SIMULATION (DEV MODE)] ================")
                console.log(`To: ${mailOptions.to}`)
                console.log(`Subject: ${mailOptions.subject}`)
                if (mailOptions.text) console.log(`Text Body: ${mailOptions.text}`)
                console.log(`From: ${mailOptions.from || config.appName}`)
                console.log("=================================================================\n")
                return { messageId: "simulated-" + Date.now() }
            },
        }
    }

    return transporter
}

export const sendMail = async ({ email, subject, html, text }) => {
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
        console.error("Nodemailer error:", error.message)
        // In case live SMTP fails (e.g. invalid app password), log email and allow flow to continue in dev
        console.log(`[Email Fallback Notice] Email to ${email} (Subject: ${subject}) could not be sent via SMTP (${error.message}).`)
        return { error: error.message }
    }
}

export default sendMail
