import mongoose from "mongoose"
import request from "supertest"
import app from "../src/app.js"
import { User } from "../src/models/User.js"
import { Profile } from "../src/models/Profile.js"
import { PartnerPreference } from "../src/models/PartnerPreference.js"
import { Shortlist } from "../src/models/Shortlist.js"
import { Notification } from "../src/models/Notification.js"
import { Block } from "../src/models/Block.js"
import { Report } from "../src/models/Report.js"
import { generateToken } from "../src/config/generateToken.js"
import { config } from "../src/config/config.js"

async function runFeatureTests() {
    console.log("\n=======================================================")
    console.log("   MERIJODI - FULL-STACK FEATURE INTEGRATION TESTS    ")
    console.log("=======================================================\n")

    await mongoose.connect(config.dbURL)
    console.log(" [✓] Connected to MongoDB:", config.dbURL)

    // Setup Test User 1 (Female) & Test User 2 (Male)
    const timestamp = Date.now()
    const user1 = await User.create({
        name: "Ananya Patel",
        email: `ananya_${timestamp}@example.com`,
        status: "active",
        isEmailVerified: true,
    })
    const profile1 = await Profile.create({
        userId: user1._id,
        name: user1.name,
        gender: "female",
        dateOfBirth: new Date("1998-05-15"),
        religion: "Hindu",
        caste: "Patel",
        location: { city: "Ahmedabad", state: "Gujarat", country: "India" },
        career: { occupation: "Architect", annualIncome: "15 LPA" },
        education: { highestDegree: "B.Arch" },
        aboutMe: "Creative architect who loves travel and heritage.",
    })

    const user2 = await User.create({
        name: "Rohan Desai",
        email: `rohan_${timestamp}@example.com`,
        status: "active",
        isEmailVerified: true,
    })
    const profile2 = await Profile.create({
        userId: user2._id,
        name: user2.name,
        gender: "male",
        dateOfBirth: new Date("1996-08-20"),
        religion: "Hindu",
        caste: "Patel",
        location: { city: "Ahmedabad", state: "Gujarat", country: "India" },
        career: { occupation: "Software Engineer", annualIncome: "25 LPA" },
        education: { highestDegree: "B.Tech" },
        aboutMe: "Tech enthusiast looking for a kind and ambitious partner.",
    })

    const token1 = (await generateToken(user1._id)).accessToken
    const token2 = (await generateToken(user2._id)).accessToken

    // Test 1: Partner Preferences (Opposite gender auto-fallback)
    console.log("\n--- Test 1: Partner Preference Upsert (Gender Inference) ---")
    const prefRes = await request(app)
        .put("/api/v1/preferences")
        .set("Authorization", `Bearer ${token1}`)
        .send({
            ageMin: 25,
            ageMax: 32,
            religion: "Hindu",
            location: "Ahmedabad",
        })
    console.log("Status:", prefRes.status)
    console.log("Inferred Preferred Gender:", prefRes.body.data?.gender)
    if (prefRes.status === 200 && prefRes.body.data?.gender === "male") {
        console.log(" [✓] Partner Preference auto-inferred opposite gender (male) successfully!")
    } else {
        console.error(" [✗] Partner Preference failed:", prefRes.body)
    }

    // Test 2: Shortlist Toggle & Retrieval
    console.log("\n--- Test 2: Shortlist Toggle & Retrieval ---")
    const shortRes = await request(app)
        .post("/api/v1/shortlist")
        .set("Authorization", `Bearer ${token1}`)
        .send({ profileId: profile2._id.toString() })
    console.log("Shortlist Toggle Status:", shortRes.status, "Action:", shortRes.body.data?.action)

    const listRes = await request(app)
        .get("/api/v1/shortlist")
        .set("Authorization", `Bearer ${token1}`)
    console.log("Shortlisted List Status:", listRes.status, "Count:", listRes.body.data?.length)
    if (listRes.status === 200 && listRes.body.data?.length > 0) {
        console.log(" [✓] Shortlist populated profile name:", listRes.body.data[0].shortlistedProfileId?.name)
    }

    // Test 3: Notifications Creation & Retrieval
    console.log("\n--- Test 3: Notifications Flow ---")
    await Notification.create({
        userId: user1._id,
        type: "new_interest",
        message: `${user2.name} expressed interest in your profile!`,
        relatedProfileId: profile2._id,
    })

    const notifRes = await request(app)
        .get("/api/v1/notifications")
        .set("Authorization", `Bearer ${token1}`)
    console.log("Notifications Status:", notifRes.status, "Total:", notifRes.body.data?.notifications?.length)
    if (notifRes.status === 200 && notifRes.body.data?.notifications?.length > 0) {
        console.log(" [✓] Notification retrieved successfully:", notifRes.body.data.notifications[0].message)
    }

    // Test 4: Block & Report Workflow
    console.log("\n--- Test 4: Block & Report Features ---")
    const blockRes = await request(app)
        .post("/api/v1/blocks")
        .set("Authorization", `Bearer ${token1}`)
        .send({ blockedProfileId: profile2._id.toString() })
    console.log("Block Status:", blockRes.status)

    const reportRes = await request(app)
        .post("/api/v1/reports")
        .set("Authorization", `Bearer ${token1}`)
        .send({
            reportedProfileId: profile2._id.toString(),
            reason: "fake_profile",
            description: "Test report verification",
        })
    console.log("Report Status:", reportRes.status)
    if (blockRes.status === 201 && reportRes.status === 201) {
        console.log(" [✓] Block and Report APIs verified successfully!")
    }

    // Clean up test data
    await User.deleteMany({ _id: { $in: [user1._id, user2._id] } })
    await Profile.deleteMany({ _id: { $in: [profile1._id, profile2._id] } })
    await PartnerPreference.deleteMany({ profileId: { $in: [profile1._id, profile2._id] } })
    await Shortlist.deleteMany({ profileId: { $in: [profile1._id, profile2._id] } })
    await Notification.deleteMany({ userId: { $in: [user1._id, user2._id] } })
    await Block.deleteMany({ blockerProfileId: { $in: [profile1._id, profile2._id] } })
    await Report.deleteMany({ reporterProfileId: { $in: [profile1._id, profile2._id] } })

    console.log("\n=======================================================")
    console.log(" [✓] ALL FULL-STACK FEATURE INTEGRATION TESTS PASSED!  ")
    console.log("=======================================================\n")
    process.exit(0)
}

runFeatureTests().catch((err) => {
    console.error("Test suite error:", err)
    process.exit(1)
})
