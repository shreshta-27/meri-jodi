import { User } from "../models/User.js"
import { Profile } from "../models/Profile.js"
import { ROLES, USER_STATUS, GENDER } from "../constants/index.js"

/**
 * Automatically seeds default Admin credentials into MongoDB on server startup if not present.
 * Default credentials:
 * Email: admin@merijodi.com
 * Password: AdminPassword@123
 */
export const seedAdmin = async () => {
    try {
        const adminEmail = (process.env.ADMIN_EMAIL || "admin@merijodi.com").toLowerCase().trim()
        const adminPassword = process.env.ADMIN_PASSWORD || "AdminPassword@123"

        let adminUser = await User.findOne({ email: adminEmail })

        if (!adminUser) {
            console.log(`[Admin Seed] Creating default administrator account (${adminEmail})...`)
            adminUser = new User({
                name: "MeriJodi Administrator",
                email: adminEmail,
                role: ROLES.ADMIN,
                status: USER_STATUS.ACTIVE,
                isEmailVerified: true,
                isPhoneVerified: true,
                phone: "+919876543210",
                lastLogin: new Date(),
            })
            await adminUser.setPassword(adminPassword)
            await adminUser.save()

            // Create admin profile
            await Profile.findOneAndUpdate(
                { userId: adminUser._id },
                {
                    userId: adminUser._id,
                    name: adminUser.name,
                    gender: GENDER.MALE,
                    aboutMe: "Platform Administrator Console for MeriJodi Matrimonial Portal.",
                    isVerified: true,
                    profileCompletionPct: 100,
                    location: {
                        city: "Mumbai",
                        state: "Maharashtra",
                        country: "India",
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )

            console.log(`[Admin Seed] Successfully initialized admin account: ${adminEmail}`)
        } else {
            adminUser.role = ROLES.ADMIN
            adminUser.status = USER_STATUS.ACTIVE
            adminUser.isEmailVerified = true
            adminUser.isPhoneVerified = true
            await adminUser.setPassword(adminPassword)
            await adminUser.save()

            await Profile.findOneAndUpdate(
                { userId: adminUser._id },
                {
                    userId: adminUser._id,
                    name: adminUser.name || "MeriJodi Administrator",
                    gender: GENDER.MALE,
                    aboutMe: "Platform Administrator Console for MeriJodi Matrimonial Portal.",
                    isVerified: true,
                    profileCompletionPct: 100,
                    location: {
                        city: "Mumbai",
                        state: "Maharashtra",
                        country: "India",
                    },
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )

            console.log(`[Admin Seed] Verified and synchronized administrator credentials for ${adminEmail}`)
        }
    } catch (error) {
        console.error("[Admin Seed Error] Failed to seed default admin:", error.message)
    }
}
