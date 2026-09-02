import dns from "dns"
import mongoose from "mongoose"
import { config } from "./config.js"

// Configure Google DNS (8.8.8.8, 8.8.4.4) for reliable MongoDB Atlas SRV resolution
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"])
} catch (e) {
    console.warn("Could not set custom DNS servers:", e.message)
}

const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/meri"

const connectDB = async () => {
    try {
        if (!config.dbURL) {
            throw new Error(
                "MongoDB connection string (DB_URI) is not defined in environment variables"
            )
        }

        await mongoose.connect(config.dbURL, {
            dbName: "meri",
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        })

        console.log(`Connected to MongoDB Atlas (${mongoose.connection.name}) successfully.`)

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err)
        })

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected. Attempting to reconnect...")
        })

        mongoose.connection.on("reconnected", () => {
            console.log("MongoDB reconnected")
        })
    } catch (primaryError) {
        console.warn(`Primary database connection error (${primaryError.message}). Attempting fallback to local MongoDB...`)
        try {
            await mongoose.connect(LOCAL_MONGO_URI, {
                serverSelectionTimeoutMS: 4000,
                socketTimeoutMS: 45000,
            })
            console.log(`Connected to local MongoDB (${LOCAL_MONGO_URI}) successfully.`)

            mongoose.connection.on("error", (err) => {
                console.error("Local MongoDB connection error:", err)
            })
        } catch (localError) {
            console.error("Both primary Atlas and local MongoDB connections failed:", localError.message)
            throw primaryError
        }
    }
}

export default connectDB

