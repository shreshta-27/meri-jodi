import { createClient } from "redis"
import { config } from "./config.js"

class MemoryRedisFallback {
    constructor() {
        this.store = new Map()
        this.timers = new Map()
    }

    async get(key) {
        if (!this.store.has(key)) return null
        return this.store.get(key)
    }

    async set(key, value, options = {}) {
        const strVal = typeof value === "string" ? value : JSON.stringify(value)
        this.store.set(key, strVal)

        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key))
            this.timers.delete(key)
        }

        const expireSeconds = options.EX || options.ex
        if (expireSeconds && expireSeconds > 0) {
            const timer = setTimeout(() => {
                this.store.delete(key)
                this.timers.delete(key)
            }, expireSeconds * 1000)
            if (timer.unref) timer.unref()
            this.timers.set(key, timer)
        }

        return "OK"
    }

    async setEx(key, seconds, value) {
        return this.set(key, value, { EX: seconds })
    }

    async del(key) {
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key))
            this.timers.delete(key)
        }
        const exists = this.store.has(key)
        this.store.delete(key)
        return exists ? 1 : 0
    }

    async flushAll() {
        for (const timer of this.timers.values()) {
            clearTimeout(timer)
        }
        this.timers.clear()
        this.store.clear()
        return "OK"
    }
}

let nativeClient = null
let isConnected = false
const memoryFallback = new MemoryRedisFallback()

if (config.redisUrl && !process.env.DISABLE_REDIS) {
    try {
        nativeClient = createClient({
            url: config.redisUrl,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 3) return false
                    return Math.min(retries * 500, 2000)
                },
                connectTimeout: 5000,
            },
        })

        nativeClient.on("connect", () => {
            isConnected = true
            console.log("Connected to Redis server successfully")
        })

        nativeClient.on("ready", () => {
            isConnected = true
        })

        nativeClient.on("error", () => {
            isConnected = false
        })

        nativeClient.connect().catch((err) => {
            isConnected = false
            console.log("Redis server not reachable, using in-memory store for OTP, rate limiting, and caching.")
        })
    } catch (e) {
        isConnected = false
    }
}

export const redisClient = {
    async get(key) {
        if (isConnected && nativeClient?.isOpen) {
            try {
                return await nativeClient.get(key)
            } catch (err) {
                return memoryFallback.get(key)
            }
        }
        return memoryFallback.get(key)
    },

    async set(key, value, options = {}) {
        if (isConnected && nativeClient?.isOpen) {
            try {
                return await nativeClient.set(key, value, options)
            } catch (err) {
                return memoryFallback.set(key, value, options)
            }
        }
        return memoryFallback.set(key, value, options)
    },

    async setEx(key, seconds, value) {
        if (isConnected && nativeClient?.isOpen) {
            try {
                return await nativeClient.setEx(key, seconds, value)
            } catch (err) {
                return memoryFallback.setEx(key, seconds, value)
            }
        }
        return memoryFallback.setEx(key, seconds, value)
    },

    async del(key) {
        if (isConnected && nativeClient?.isOpen) {
            try {
                return await nativeClient.del(key)
            } catch (err) {
                return memoryFallback.del(key)
            }
        }
        return memoryFallback.del(key)
    },

    async flushAll() {
        if (isConnected && nativeClient?.isOpen) {
            try {
                await nativeClient.flushAll()
            } catch (err) {
                // ignore
            }
        }
        return memoryFallback.flushAll()
    },

    get isReady() {
        return isConnected
    },
}

export default redisClient
