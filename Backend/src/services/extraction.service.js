import { GoogleGenAI, Type } from "@google/genai"
let aiClient = null
const getAI = () => {
    if (!aiClient && process.env.GEMINI_API_KEY) {
        aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    }
    return aiClient
}

const biodataSchema = {
    type: Type.OBJECT,
    properties: {
        personal_details: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                gender: { type: Type.STRING },
                date_of_birth: { type: Type.STRING },
                place_of_birth: { type: Type.STRING },
                time_of_birth: { type: Type.STRING },
                rashi: { type: Type.STRING },
                nakshatra: { type: Type.STRING },
                height: { type: Type.STRING },
                marital_status: { type: Type.STRING },
                manglik: { type: Type.STRING },
                complexion: { type: Type.STRING },
                highest_education: { type: Type.STRING },
                organization_name: { type: Type.STRING },
                annual_income: { type: Type.STRING },
                about_me: { type: Type.STRING },
                mother_tongue: { type: Type.STRING },
            },
        },
        family_details: {
            type: Type.OBJECT,
            properties: {
                fathers_name: { type: Type.STRING },
                fathers_occupation: { type: Type.STRING },
                mothers_name: { type: Type.STRING },
                mothers_occupation: { type: Type.STRING },
            },
        },
        contact_details: {
            type: Type.OBJECT,
            properties: {
                contact_number: { type: Type.STRING },
                email_id: { type: Type.STRING },
                city: { type: Type.STRING },
            },
        },
    },
}

class ExtractionService {
    async extractBiodata(fileBuffer, mimeType) {
        if (!process.env.GEMINI_API_KEY) {
            const error = new Error("AI Biodata extraction service is not configured (missing GEMINI_API_KEY).")
            error.statusCode = 503
            throw error
        }

        const filePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType,
            },
        }

        const prompt = "Extract all profile details accurately from this document into the required JSON schema. Only return valid JSON matching the schema."

        const ai = getAI()
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [filePart, prompt],
            config: {
                responseMimeType: "application/json",
                responseSchema: biodataSchema,
            },
        })

        const text = response?.text?.trim() || ""
        if (!text) {
            throw new Error("AI returned no extracted data.")
        }

        try {
            return JSON.parse(text)
        } catch (parseError) {
            console.error("Failed to parse AI response as JSON:", parseError, text)
            throw new Error("Failed to parse extracted data.")
        }
    }

    /**
     * Generate an engaging, culturally appropriate matrimonial bio for a profile.
     * @param {object} details - { name, gender, age, occupation, education, companyName, city, hobbies, religion, diet }
     * @returns {Promise<string>} Generated bio string
     */
    async generateBio(details = {}) {
        const {
            name = "A prospective member",
            gender = "",
            age = "",
            occupation = "",
            education = "",
            companyName = "",
            city = "",
            hobbies = [],
            religion = "",
            diet = "",
            familyValues = "",
        } = details

        const prompt = `You are an expert matrimonial matchmaker and profile writer for MeriJodi matrimonial platform.
Write a warm, authentic, modern, and culturally grounded "About Me" introduction (2 short paragraphs, around 80-140 words total) for the following matrimonial profile:
- Name: ${name}
- Gender: ${gender || "Not specified"}
- Age: ${age || "Not specified"}
- Education: ${education || "Not specified"}
- Occupation/Career: ${occupation || "Professional"} ${companyName ? `at ${companyName}` : ""}
- Location: ${city || "India"}
- Hobbies & Interests: ${Array.isArray(hobbies) && hobbies.length > 0 ? hobbies.join(", ") : "Reading, traveling, music"}
- Religion/Tradition: ${religion || "Not specified"}
- Diet/Lifestyle: ${diet || "Not specified"}
- Family Background/Values: ${familyValues || "Traditional yet progressive values"}

Guidelines:
1. Write in the first person ("I am...").
2. First paragraph: Introduce personality, career aspirations, education, and passions.
3. Second paragraph: Describe family background, values, lifestyle, and what qualities are sought in a life partner.
4. Keep the tone respectful, genuine, modern, and appealing for marriage.
5. Do NOT include headings, quotes, bullet points, or placeholders. Output ONLY the raw paragraph text.`

        // Try Gemini 2.5 Flash first
        if (process.env.GEMINI_API_KEY) {
            try {
                const ai = getAI()
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                })
                const text = response?.text?.trim()
                if (text) return text
            } catch (err) {
                console.warn("Gemini bio generation failed, trying Groq fallback:", err.message)
            }
        }

        // Try Groq fallback
        if (process.env.GROQ_API_KEY) {
            try {
                const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: "You are a professional matrimonial profile writer." },
                            { role: "user", content: prompt },
                        ],
                        temperature: 0.7,
                        max_tokens: 350,
                    }),
                })
                const groqData = await groqRes.json()
                const text = groqData.choices?.[0]?.message?.content?.trim()
                if (text) return text
            } catch (groqErr) {
                console.warn("Groq bio generation fallback failed:", groqErr.message)
            }
        }

        // Resilient template fallback
        const hobbiesStr = Array.isArray(hobbies) && hobbies.length > 0
            ? hobbies.join(", ")
            : "traveling, listening to music, and spending time with family"

        return `Hello! I am ${name}, a ${occupation || "professional"} based in ${city || "India"}${education ? ` with a degree in ${education}` : ""}. I am an easy-going, optimistic, and ambitious individual who enjoys balancing career goals with personal passions. In my free time, I love ${hobbiesStr}.

I come from a loving and supportive family that values mutual respect and integrity. I am looking for an understanding, kind-hearted, and like-minded partner who shares similar life values, enjoys meaningful conversations, and is ready to embark on a beautiful journey of companionship together.`
    }

    /**
     * Generate context-aware AI chat conversation starters or reply suggestions.
     * @param {object} partnerDetails - { name, occupation, education, city, hobbies, religion, diet, aboutMe }
     * @param {string} lastMessage - Optional previous message in conversation
     * @param {string} category - "icebreaker" | "compliments" | "shared_interests" | "thoughtful"
     * @returns {Promise<Array<string>>} List of 4 suggestion strings
     */
    async generateChatSuggestions(partnerDetails = {}, lastMessage = "", category = "icebreaker") {
        const {
            name = "there",
            occupation = "",
            education = "",
            city = "",
            hobbies = [],
            religion = "",
            aboutMe = "",
        } = partnerDetails

        const firstName = name.split(" ")[0] || "there"
        const hobbiesStr = Array.isArray(hobbies) && hobbies.length > 0 ? hobbies.join(", ") : ""

        const prompt = `You are an AI matrimonial conversation assistant for MeriJodi. Generate 4 polite, engaging, warm, culturally appropriate, and natural conversation starter/reply messages (each 1-2 short sentences, maximum 25 words per message) for a user to send to their match on MeriJodi.

Match Profile Details:
- First Name: ${firstName}
- Occupation: ${occupation || "Professional"}
- Education: ${education || "Graduate"}
- Location: ${city || "India"}
- Hobbies: ${hobbiesStr || "Reading, travel, music"}
- Religion: ${religion || "Traditional"}
- Bio Snippet: ${aboutMe ? aboutMe.slice(0, 100) : "Looking for a compatible partner"}
- Context (Last message received): ${lastMessage ? `"${lastMessage}"` : "Starting a new conversation"}
- Goal/Vibe: ${category || "warm matrimonial icebreaker"}

Rules:
1. Each suggestion must be polite, respectful, and appealing for matrimonial matchmaking.
2. Personalize referencing their occupation, city, or hobbies when available.
3. Return ONLY a valid JSON array of 4 strings (e.g. ["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4"]). Do not return markdown backticks or any other text.`

        // Try Gemini 2.5 Flash
        if (process.env.GEMINI_API_KEY) {
            try {
                const ai = getAI()
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                })
                let text = response?.text?.trim()
                if (text) {
                    if (text.startsWith("```json")) {
                        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "")
                    } else if (text.startsWith("```")) {
                        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "")
                    }
                    const parsed = JSON.parse(text)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.slice(0, 4)
                    }
                }
            } catch (err) {
                console.warn("Gemini chat suggestion generation failed, trying Groq fallback:", err.message)
            }
        }

        // Try Groq fallback
        if (process.env.GROQ_API_KEY) {
            try {
                const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [
                            { role: "system", content: "You are a helpful matrimonial conversation assistant. Return ONLY a JSON array of 4 string suggestions." },
                            { role: "user", content: prompt },
                        ],
                        temperature: 0.7,
                        max_tokens: 300,
                    }),
                })
                const groqData = await groqRes.json()
                let text = groqData.choices?.[0]?.message?.content?.trim()
                if (text) {
                    if (text.startsWith("```json")) {
                        text = text.replace(/^```json\s*/, "").replace(/\s*```$/, "")
                    } else if (text.startsWith("```")) {
                        text = text.replace(/^```\s*/, "").replace(/\s*```$/, "")
                    }
                    const parsed = JSON.parse(text)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        return parsed.slice(0, 4)
                    }
                }
            } catch (groqErr) {
                console.warn("Groq chat suggestion fallback failed:", groqErr.message)
            }
        }

        // Smart contextual fallback suggestions
        const suggestions = []

        if (lastMessage) {
            suggestions.push(`Thanks for your message, ${firstName}! That sounds really interesting. How has the rest of your week been?`)
            suggestions.push(`I appreciate you sharing that, ${firstName}. I would love to learn more about your thoughts on this!`)
            suggestions.push(`Hello ${firstName}! That's wonderful. What do you enjoy most in your day-to-day routine?`)
            suggestions.push(`Thank you for reaching out, ${firstName}. Shall we talk a bit about our family backgrounds and interests?`)
        } else {
            if (occupation) {
                suggestions.push(`Hi ${firstName}! I saw your profile and was really impressed by your work in ${occupation}. How is your week going?`)
            } else {
                suggestions.push(`Hi ${firstName}! I came across your profile on MeriJodi and would love to connect and get to know you better.`)
            }

            if (hobbies.length > 0) {
                const firstHobby = hobbies[0]
                suggestions.push(`Hello ${firstName}! I noticed you enjoy ${firstHobby}—I find that exciting. What got you into it?`)
            } else if (city) {
                suggestions.push(`Hello ${firstName}! It's great to connect with someone from ${city}. How are things in your city?`)
            } else {
                suggestions.push(`Hello ${firstName}! I really liked your profile bio and thought we might share similar values and interests.`)
            }

            if (city) {
                suggestions.push(`Hi ${firstName}! How do you usually like to spend your free time in ${city}?`)
            } else {
                suggestions.push(`Hi ${firstName}! What are some hobbies or passions that you are currently enthusiastic about?`)
            }

            suggestions.push(`Namaste ${firstName}! I'd love to know more about your lifestyle preferences and what you look for in a life partner.`)
        }

        return suggestions.slice(0, 4)
    }
}

export default new ExtractionService()
