import { GoogleGenAI, Type } from "@google/genai"
import "dotenv/config"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

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
}

export default new ExtractionService()
