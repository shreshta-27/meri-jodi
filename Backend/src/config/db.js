import mongoose from "mongoose"
import { config } from "./config.js"

const connectDB = async () => {
    try {
        if (!config.dbURL) {
            throw new Error(
                "MongoDB connection string (DB_URI) is not defined in environment variables"
            )
        }

        await mongoose.connect(config.dbURL, {
            // These options help with connection stability
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        })

        console.log("MongoDB connected successfully")

        // Handle connection errors after initial connection
        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err)
        })

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...")
        })

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected")
        })
    } catch (error) {
        console.error("Database connection error:", error.message)
        // Don't exit the process here, let the caller handle it
        throw error
    }
}

export default connectDB
