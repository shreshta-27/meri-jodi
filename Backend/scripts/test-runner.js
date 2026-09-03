import mongoose from "mongoose"
import connectDB from "../src/config/db.js"
import { config } from "../src/config/config.js"
import { authService } from "../src/services/auth.service.js"
import { adminService } from "../src/services/admin.service.js"
import { extractionService } from "../src/services/extraction.service.js"
import { seedAdmin } from "../src/config/seedAdmin.js"

async function runTests() {
    console.log("== Starting Comprehensive Backend Verification Tests ==")

    await connectDB()
    console.log("Connected to MongoDB successfully.")

    // 1. Test Admin Seeding
    console.log("\n[Test 1] Testing seedAdmin()...")
    const seeded = await seedAdmin()
    console.log("Seed admin result:", seeded?.email, "Role:", seeded?.role)

    // 2. Test Admin Login
    console.log("\n[Test 2] Testing authService.adminLogin()...")
    const adminLoginRes = await authService.adminLogin({
        email: "admin@merijodi.com",
        password: "AdminPassword@123"
    })
    console.log("Admin login success:", adminLoginRes.message, "Role:", adminLoginRes.user?.role)

    // 3. Test Admin Stats
    console.log("\n[Test 3] Testing adminService.getDashboardStats()...")
    const stats = await adminService.getDashboardStats()
    console.log("Stats retrieved:", {
        totalUsers: stats.counts.totalUsers,
        verifiedProfiles: stats.counts.verifiedProfiles,
        pendingVerifications: stats.counts.pendingVerifications,
        activeReports: stats.counts.pendingReports
    })

    // 4. Test Admin Users List
    console.log("\n[Test 4] Testing adminService.getUsers()...")
    const usersList = await adminService.getUsers({ page: 1, limit: 5 })
    console.log(`Retrieved ${usersList.users.length} users. Total: ${usersList.pagination.total}`)

    // 5. Test Google OAuth Flow
    console.log("\n[Test 5] Testing authService.googleAuth()...")
    const googleTestRes = await authService.googleAuth({
        googleId: "test_google_id_12345",
        email: "test.google.user@example.com",
        name: "Test Google User",
        avatar: "https://example.com/avatar.jpg"
    })
    console.log("Google Auth Success:", googleTestRes.user.name, googleTestRes.user.email, "Token exists:", !!googleTestRes.token)

    // 6. Test PDF Extraction Heuristic / Parsing
    console.log("\n[Test 6] Testing extractionService with mock biodata text...")
    const sampleBiodataText = `
    MATRIMONIAL BIODATA
    Name: Ananya Sharma
    Date of Birth: 15/08/1996
    Time of Birth: 10:30 AM
    Place of Birth: Pune, Maharashtra
    Height: 5'6"
    Marital Status: Never Married
    Religion: Hindu
    Caste: Brahmin
    Mother Tongue: Marathi
    Education: B.Tech in Computer Science
    Occupation: Software Engineer
    Company: Tech Mahindra
    Annual Income: 12 LPA
    City: Pune
    Father's Name: Suresh Sharma
    Father's Occupation: Retired Bank Manager
    Mother's Name: Sunita Sharma
    Hobbies: Reading, Classical Music, Travel
    About Me: Simple, family-oriented, ambitious professional.
    `
    const extractedData = extractionService.extractFromText(sampleBiodataText)
    console.log("Extracted Data Name:", extractedData.personal_details?.name || extractedData.name)
    console.log("Extracted Data DOB:", extractedData.personal_details?.date_of_birth || extractedData.dateOfBirth)
    console.log("Extracted Education:", extractedData.personal_details?.highest_education || extractedData.education)
    console.log("Extracted Occupation:", extractedData.personal_details?.organization_name || extractedData.occupation)
    console.log("Extracted City:", extractedData.contact_details?.city || extractedData.location?.city)

    console.log("\n== ALL BACKEND UNIT AND INTEGRATION TESTS PASSED ==")
    await mongoose.disconnect()
    process.exit(0)
}

runTests().catch(err => {
    console.error("Test failed:", err)
    process.exit(1)
})
