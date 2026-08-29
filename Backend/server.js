import app from "./src/app.js"
import connectDB from "./src/config/db.js"
import { config } from "./src/config/config.js"
import setupSocket from "./src/socket.js"

const startServer = async () => {
    await connectDB()

    const PORT = config.port || 5000
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

    // Attach Socket.io
    setupSocket(server)

    // Graceful shutdown
    const shutdown = async (signal) => {
        console.log(`\n${signal} received. Shutting down gracefully...`)
        server.close(async () => {
            console.log("HTTP server closed")
            const mongoose = await import("mongoose")
            await mongoose.default.connection.close()
            console.log("MongoDB connection closed")
            process.exit(0)
        })

        // Force shutdown after 10s
        setTimeout(() => {
            console.error("Forced shutdown after timeout")
            process.exit(1)
        }, 10000)
    }

    process.on("SIGTERM", () => shutdown("SIGTERM"))
    process.on("SIGINT", () => shutdown("SIGINT"))
}

startServer().catch((err) => {
    console.error("Failed to start server:", err)
    process.exit(1)
})
