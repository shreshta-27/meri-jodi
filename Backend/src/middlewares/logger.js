import fs from "fs"
import morgan from "morgan"
import { join } from "path"
import { fileURLToPath } from "url"
import { dirname } from "path"

// Get directory name in ES module context
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Ensure logs directory exists (at project root, not inside src/)
const logsDir = join(dirname(dirname(__dirname)), "logs")
fs.mkdirSync(logsDir, { recursive: true })

// Create access log stream
const accessLogPath = join(logsDir, "access.log")
const accessLogStream = fs.createWriteStream(accessLogPath, { flags: "a" })

// Custom token for request ID
morgan.token("id", (req) => req.id)

/**
 * Configure and return Morgan logger middleware based on environment
 * @param {string} nodeEnv - The current environment (production, development, etc.)
 * @returns {Function} Configured Morgan middleware
 */
export const configureLogger = (nodeEnv) => {
    if (nodeEnv === "production") {
        // Production format: include request ID for log correlation
        const productionFormat = ":id :remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length] \":referrer\" \":user-agent\""
        return morgan(productionFormat, {
            skip: (req, res) => res.statusCode < 400,
            stream: accessLogStream,
        })
    }

    // Development format: include request ID
    return morgan(":id :method :url :status :response-time ms")
}

export default configureLogger
