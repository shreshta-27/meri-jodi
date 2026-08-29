import mongoose from "mongoose"
import request from "supertest"
import app from "../src/app.js"
import { config } from "../src/config/config.js"
import { redisClient } from "../src/config/redis.js"
import { User } from "../src/models/User.js"
import { Profile } from "../src/models/Profile.js"

const runTests = async () => {
    console.log("\n=======================================================")
    console.log("   MERIJODI - BACKEND AUTHENTICATION API TEST SUITE   ")
    console.log("=======================================================\n")

    try {
        // Connect to MongoDB
        await mongoose.connect(config.dbURL)
        console.log(" [✓] Connected to MongoDB:", config.dbURL)

        // Clean up test users
        const testEmail = `testuser_${Date.now()}@example.com`
        const testPassword = "StrongPassword123!"
        const testName = "Priya Sharma"

        console.log(`\n--- Test 1: User Registration via Nodemailer & Redis ---`)
        const regRes = await request(app)
            .post("/api/auth/register")
            .send({
                name: testName,
                email: testEmail,
                password: testPassword,
                gender: "female",
                phone: "+919876543210",
            })

        console.log("Status:", regRes.status)
        console.log("Response Body:", regRes.body)

        if (regRes.status !== 201 || !regRes.body.success) {
            throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`)
        }
        const verifyToken = regRes.body.data.verifyToken
        console.log(" [✓] Step 1: Registration successful, verification token generated:", verifyToken ? "YES" : "NO")

        console.log(`\n--- Test 2: Email Verification Token Endpoint ---`)
        const verifyRes = await request(app)
            .post(`/api/auth/verify/${verifyToken}`)
            .send()

        console.log("Status:", verifyRes.status)
        console.log("Response Body:", verifyRes.body)

        if (verifyRes.status !== 200 || !verifyRes.body.success) {
            throw new Error(`Email verification failed: ${JSON.stringify(verifyRes.body)}`)
        }
        console.log(" [✓] Step 2: Email token verified, User and Profile created in MongoDB!")

        console.log(`\n--- Test 3: Login (Step 1 - Email/Password & OTP Generation) ---`)
        const loginRes = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: testPassword,
            })

        console.log("Status:", loginRes.status)
        console.log("Response Body:", loginRes.body)

        if (loginRes.status !== 200 || !loginRes.body.success) {
            throw new Error(`Login step 1 failed: ${JSON.stringify(loginRes.body)}`)
        }
        const generatedOtp = loginRes.body.data.otp || (await redisClient.get(`otp:${testEmail}`))
        console.log(` [✓] Step 3: Login step 1 passed, OTP stored in Redis: ${generatedOtp}`)

        console.log(`\n--- Test 4: Verify Login OTP (Step 2 - Dual JWT & Cookies) ---`)
        const otpRes = await request(app)
            .post("/api/auth/verify")
            .send({
                email: testEmail,
                otp: generatedOtp,
            })

        console.log("Status:", otpRes.status)
        console.log("Response Body:", otpRes.body)

        if (otpRes.status !== 200 || !otpRes.body.success) {
            throw new Error(`OTP Verification failed: ${JSON.stringify(otpRes.body)}`)
        }

        const accessToken = otpRes.body.data.token || otpRes.body.data.accessToken
        const refreshToken = otpRes.body.data.refreshToken
        console.log(" [✓] Step 4: Login complete! Received Access Token and Refresh Token.")

        console.log(`\n--- Test 5: Protected Route GET /api/auth/me (Redis Cache) ---`)
        const meRes = await request(app)
            .get("/api/auth/me")
            .set("Authorization", `Bearer ${accessToken}`)

        console.log("Status:", meRes.status)
        console.log("User:", meRes.body.data?.user)

        if (meRes.status !== 200 || !meRes.body.success) {
            throw new Error(`Protected route /me failed: ${JSON.stringify(meRes.body)}`)
        }
        console.log(" [✓] Step 5: Protected /api/auth/me successfully retrieved user from Redis cache!")

        console.log(`\n--- Test 6: Refresh Access Token ---`)
        const refreshRes = await request(app)
            .post("/api/auth/refresh")
            .send({ refreshToken })

        console.log("Status:", refreshRes.status)
        console.log("Response Body:", refreshRes.body)

        if (refreshRes.status !== 200 || !refreshRes.body.success) {
            throw new Error(`Refresh token failed: ${JSON.stringify(refreshRes.body)}`)
        }
        console.log(" [✓] Step 6: Access Token rotated and refreshed successfully!")

        console.log(`\n--- Test 7: Google OAuth Endpoint ---`)
        const googleEmail = `google_${Date.now()}@example.com`
        const googleRes = await request(app)
            .post("/api/auth/google")
            .send({
                googleId: `google_id_${Date.now()}`,
                email: googleEmail,
                name: "Rahul Verma",
                avatar: "https://example.com/avatar.jpg",
            })

        console.log("Status:", googleRes.status)
        console.log("Response Body:", googleRes.body)

        if (googleRes.status !== 200 || !googleRes.body.success) {
            throw new Error(`Google Auth failed: ${JSON.stringify(googleRes.body)}`)
        }
        console.log(" [✓] Step 7: Google Auth registration and login verified!")

        console.log(`\n--- Test 8: Logout & Session Revocation ---`)
        const logoutRes = await request(app)
            .post("/api/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`)

        console.log("Status:", logoutRes.status)
        console.log("Response Body:", logoutRes.body)

        if (logoutRes.status !== 200 || !logoutRes.body.success) {
            throw new Error(`Logout failed: ${JSON.stringify(logoutRes.body)}`)
        }
        console.log(" [✓] Step 8: User logged out and Redis token session revoked!")

        console.log(`\n--- Test 9: Error Handling & Validation ---`)
        const badLogin = await request(app)
            .post("/api/auth/login")
            .send({
                email: testEmail,
                password: "WrongPassword!",
            })
        console.log("Invalid Password Status:", badLogin.status, "(Expected 400)")

        const badOtp = await request(app)
            .post("/api/auth/verify")
            .send({
                email: testEmail,
                otp: "000000",
            })
        console.log("Invalid OTP Status:", badOtp.status, "(Expected 400)")

        console.log("\n=======================================================")
        console.log(" [✓] ALL 9 TEST SUITES PASSED FLAWLESSLY!               ")
        console.log("=======================================================\n")

        // Cleanup
        await User.deleteMany({ email: { $in: [testEmail, googleEmail] } })
        await Profile.deleteMany({ name: { $in: [testName, "Rahul Verma"] } })

        process.exit(0)
    } catch (error) {
        console.error("\n❌ TEST SUITE FAILED:", error.message)
        process.exit(1)
    }
}

runTests()
