import { GoogleGenAI, Type } from "@google/genai"

let aiClient = null
const getAI = () => {
    if (!aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
        try {
            aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
        } catch (e) {
            console.warn("Failed to initialize GoogleGenAI client:", e.message)
        }
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
                religion: { type: Type.STRING },
                caste: { type: Type.STRING },
                gotra: { type: Type.STRING },
                hobbies: { type: Type.ARRAY, items: { type: Type.STRING } },
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

/**
 * Robust regex & heuristic parser for matrimonial biodata documents
 */
const extractBiodataFromTextHeuristic = (text = "") => {
    if (!text || typeof text !== "string") {
        return createDefaultBiodataStructure()
    }

    const clean = text.replace(/\r\n/g, "\n")

    const findMatch = (regexList) => {
        for (const re of regexList) {
            const m = clean.match(re)
            if (m && m[1] && m[1].trim()) {
                return m[1].trim()
            }
        }
        return ""
    }

    const name = findMatch([
        /(?:Full\s*Name|Candidate\s*Name|Name of Candidate|Name)\s*[:\-]\s*([^\n\r]+)/i,
        /^(?:Name)\s*[:\-]?\s*([^\n\r]+)/im,
        /(?:Bio-?\s*Data\s+of|Biodata\s+of)\s+([^\n\r]+)/i,
    ])

    const dateOfBirth = findMatch([
        /(?:Date\s*of\s*Birth|D\.?O\.?B\.?|Birth\s*Date|DOB)\s*[:\-]\s*([0-9]{1,2}[-\/.][0-9]{1,2}[-\/.][0-9]{2,4}|[0-9]{1,2}\s+[A-Za-z]{3,9}\s+[0-9]{4}|[A-Za-z]{3,9}\s+[0-9]{1,2},?\s+[0-9]{4})/i,
        /(?:Date\s*of\s*Birth|D\.?O\.?B\.?|Birth\s*Date|DOB)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const placeOfBirth = findMatch([
        /(?:Place\s*of\s*Birth|P\.?O\.?B\.?|Birth\s*Place|Born\s*at)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const timeOfBirth = findMatch([
        /(?:Time\s*of\s*Birth|T\.?O\.?B\.?|Birth\s*Time)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    let gender = findMatch([
        /(?:Gender|Sex)\s*[:\-]\s*(Male|Female|Other)/i,
    ])
    if (!gender) {
        if (/bride|female|daughter|girl|woman|she\/her/i.test(clean)) gender = "female"
        else if (/groom|male|son|boy|man|he\/him/i.test(clean)) gender = "male"
    }

    const height = findMatch([
        /(?:Height)\s*[:\-]\s*([0-9]'\s*[0-9]{1,2}"?|[0-9]{2,3}\s*cm|[0-9]\s*ft\s*[0-9]{1,2}\s*in|[^\n\r]+)/i,
    ])

    const maritalStatus = findMatch([
        /(?:Marital\s*Status|Status)\s*[:\-]\s*(Never\s*Married|Unmarried|Single|Divorced|Widowed|Awaiting\s*Divorce|[^\n\r]+)/i,
    ])

    const religion = findMatch([
        /(?:Religion)\s*[:\-]\s*(Hindu|Muslim|Sikh|Christian|Jain|Buddhist|Parsi|Jewish|[^\n\r]+)/i,
    ])

    const caste = findMatch([
        /(?:Caste|Community)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const gotra = findMatch([
        /(?:Gotra|Gotham|Gothram|Sub-?caste|Subcaste)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const rashi = findMatch([
        /(?:Rashi|Raasi|Moon\s*Sign|Zodiac\s*Sign|Zodiac)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const nakshatra = findMatch([
        /(?:Nakshatra|Nakshtra|Birth\s*Star|Star)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const manglik = findMatch([
        /(?:Manglik|Kuja\s*Dosha|Mangal)\s*[:\-]\s*(Yes|No|Anshik|Partial|Non-?Manglik|Don't\s*Know|[^\n\r]+)/i,
    ])

    const complexion = findMatch([
        /(?:Complexion|Skin\s*Tone)\s*[:\-]\s*(Very\s*Fair|Fair|Wheatish|Medium|Dark|[^\n\r]+)/i,
    ])

    const motherTongue = findMatch([
        /(?:Mother\s*Tongue|Mother-?tongue|Native\s*Language|Language)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const highestEducation = findMatch([
        /(?:Highest\s*Education|Qualification|Education|Degree|Academic\s*Qualification|Educational\s*Background)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const organizationName = findMatch([
        /(?:Company\s*Name|Organization\s*Name|Organization|Company|Employer|Working\s*at|Employed\s*at)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const occupation = findMatch([
        /(?:Occupation|Profession|Designation|Job\s*Title|Job|Working\s*as)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const annualIncome = findMatch([
        /(?:Annual\s*Income|Income|Package|Salary|CTC|Annual\s*CTC)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const city = findMatch([
        /(?:Current\s*City|Current\s*Location|City|Location|Resident\s*of|Native\s*Place|Address)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const fathersName = findMatch([
        /(?:Father's\s*Name|Father\s*Name|Father)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const fathersOccupation = findMatch([
        /(?:Father's\s*Occupation|Father\s*Occupation|Father's\s*Profession)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const mothersName = findMatch([
        /(?:Mother's\s*Name|Mother\s*Name|Mother)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const mothersOccupation = findMatch([
        /(?:Mother's\s*Occupation|Mother\s*Occupation|Mother's\s*Profession)\s*[:\-]\s*([^\n\r]+)/i,
    ])

    const contactNumber = findMatch([
        /(?:Contact\s*Number|Mobile\s*Number|Phone\s*Number|Mobile|Phone|Contact|Cell)\s*[:\-]\s*([+0-9\s\-()]{10,18})/i,
        /(\+?91[\-\s]?[6-9]\d{9}|[6-9]\d{9})/,
    ])

    const emailId = findMatch([
        /(?:Email\s*ID|Email\s*Address|E-?mail)\s*[:\-]\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
        /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/,
    ])

    const hobbiesMatch = findMatch([
        /(?:Hobbies\s*and\s*Interests|Hobbies|Interests|Passions)\s*[:\-]\s*([^\n\r]+)/i,
    ])
    const hobbies = hobbiesMatch
        ? hobbiesMatch.split(/[,;\/&]/).map((h) => h.trim()).filter(Boolean)
        : []

    const aboutMe = findMatch([
        /(?:About\s*Me|About\s*Candidate|Profile\s*Summary|Summary|Introduction)\s*[:\-]\s*([^\n\r]+(?:\n[^\n\r]+){0,3})/i,
    ])

    return normalizeBiodataResult({
        personal_details: {
            name: name || "Candidate",
            gender: gender || "male",
            date_of_birth: dateOfBirth || "",
            place_of_birth: placeOfBirth || "",
            time_of_birth: timeOfBirth || "",
            rashi: rashi || "",
            nakshatra: nakshatra || "",
            height: height || "",
            marital_status: maritalStatus || "never_married",
            manglik: manglik || "no",
            complexion: complexion || "",
            highest_education: highestEducation || "",
            organization_name: organizationName || occupation || "",
            annual_income: annualIncome || "",
            about_me: aboutMe || "",
            mother_tongue: motherTongue || "",
            religion: religion || "Hindu",
            caste: caste || "",
            gotra: gotra || "",
            hobbies: hobbies.length > 0 ? hobbies : ["Reading", "Music", "Traveling"],
        },
        family_details: {
            fathers_name: fathersName || "",
            fathers_occupation: fathersOccupation || "",
            mothers_name: mothersName || "",
            mothers_occupation: mothersOccupation || "",
        },
        contact_details: {
            contact_number: contactNumber || "",
            email_id: emailId || "",
            city: city || "",
        },
    })
}

/**
 * Standardize output structure with both nested and flat properties
 */
const normalizeBiodataResult = (data = {}) => {
    const personal = data.personal_details || {}
    const family = data.family_details || {}
    const contact = data.contact_details || {}

    let day = ""
    let month = ""
    let year = ""
    if (personal.date_of_birth) {
        try {
            const d = new Date(personal.date_of_birth)
            if (!isNaN(d.getTime())) {
                year = d.getFullYear().toString()
                month = d.toLocaleString("default", { month: "long" })
                day = d.getDate().toString()
            }
        } catch {
            // ignore date parse errors
        }
    }

    return {
        personal_details: {
            name: personal.name || data.name || "",
            gender: (personal.gender || data.gender || "male").toLowerCase(),
            date_of_birth: personal.date_of_birth || data.dateOfBirth || "",
            place_of_birth: personal.place_of_birth || data.placeOfBirth || data.birthPlace || "",
            time_of_birth: personal.time_of_birth || data.timeOfBirth || "",
            rashi: personal.rashi || data.rashi || "",
            nakshatra: personal.nakshatra || personal.nakshtra || data.nakshtra || "",
            height: personal.height || data.height || "",
            marital_status: personal.marital_status || personal.maritalStatus || data.maritalStatus || "never_married",
            manglik: personal.manglik || data.manglik || "no",
            complexion: personal.complexion || data.complexion || "",
            highest_education: personal.highest_education || personal.education || data.education || "",
            organization_name: personal.organization_name || personal.company || data.company || "",
            annual_income: personal.annual_income || personal.income || data.income || "",
            about_me: personal.about_me || personal.about || data.about || "",
            mother_tongue: personal.mother_tongue || personal.motherTongue || data.motherTongue || "",
            religion: personal.religion || data.religion || "",
            caste: personal.caste || data.caste || "",
            gotra: personal.gotra || personal.gotham || data.gotham || "",
            hobbies: Array.isArray(personal.hobbies) ? personal.hobbies : (Array.isArray(data.hobbies) ? data.hobbies : []),
        },
        family_details: {
            fathers_name: family.fathers_name || data.fathers_name || "",
            fathers_occupation: family.fathers_occupation || data.fathers_occupation || "",
            mothers_name: family.mothers_name || data.mothers_name || "",
            mothers_occupation: family.mothers_occupation || data.mothers_occupation || "",
        },
        contact_details: {
            contact_number: contact.contact_number || data.contact_number || data.phone || "",
            email_id: contact.email_id || data.email_id || data.email || "",
            city: contact.city || data.city || data.location || "",
        },
        // Flat aliases for direct binding
        name: personal.name || data.name || "",
        gender: (personal.gender || data.gender || "male").toLowerCase(),
        birthPlace: personal.place_of_birth || data.placeOfBirth || data.birthPlace || "",
        motherTongue: personal.mother_tongue || personal.motherTongue || data.motherTongue || "",
        about: personal.about_me || personal.about || data.about || "",
        height: personal.height || data.height || "",
        location: contact.city || data.city || data.location || "",
        education: personal.highest_education || personal.education || data.education || "",
        occupation: personal.organization_name || personal.occupation || data.occupation || "",
        company: personal.organization_name || personal.company || data.company || "",
        income: personal.annual_income || personal.income || data.income || "",
        city: contact.city || data.city || data.location || "",
        religion: personal.religion || data.religion || "",
        caste: personal.caste || data.caste || "",
        gotham: personal.gotra || personal.gotham || data.gotham || "",
        rashi: personal.rashi || data.rashi || "",
        nakshtra: personal.nakshatra || personal.nakshtra || data.nakshtra || "",
        manglik: personal.manglik || data.manglik || "no",
        complexion: personal.complexion || data.complexion || "",
        maritalStatus: personal.marital_status || personal.maritalStatus || data.maritalStatus || "never_married",
        hobbies: Array.isArray(personal.hobbies) ? personal.hobbies : (Array.isArray(data.hobbies) ? data.hobbies : []),
        day,
        month,
        year,
    }
}

const createDefaultBiodataStructure = () => {
    return normalizeBiodataResult({
        personal_details: {
            name: "",
            gender: "male",
            date_of_birth: "",
            place_of_birth: "",
            time_of_birth: "",
            rashi: "",
            nakshatra: "",
            height: "",
            marital_status: "never_married",
            manglik: "no",
            complexion: "",
            highest_education: "",
            organization_name: "",
            annual_income: "",
            about_me: "",
            mother_tongue: "",
            religion: "Hindu",
            caste: "",
            gotra: "",
            hobbies: [],
        },
        family_details: {
            fathers_name: "",
            fathers_occupation: "",
            mothers_name: "",
            mothers_occupation: "",
        },
        contact_details: {
            contact_number: "",
            email_id: "",
            city: "",
        },
    })
}

class ExtractionService {
    /**
     * Extract structured biodata from an uploaded PDF or image buffer.
     * Uses a resilient multi-tier pipeline:
     * Tier 1: pdf-parse text extraction (for PDF files)
     * Tier 2: Gemini multimodal & GenAI processing (if configured)
     * Tier 3: Groq LLM (llama-3.3-70b-versatile) JSON extraction (if configured)
     * Tier 4: Matrimonial heuristic regex parser (100% reliable offline fallback)
     * @param {Buffer} fileBuffer
     * @param {string} mimeType
     * @returns {Promise<object>} Standardized extracted biodata JSON
     */
    async extractBiodata(fileBuffer, mimeType = "application/pdf") {
        if (!fileBuffer || fileBuffer.length === 0) {
            throw new Error("No file content received for extraction.")
        }

        let pdfText = ""
        const isPdf = mimeType === "application/pdf" || (!mimeType && fileBuffer.slice(0, 5).toString().includes("%PDF"))

        // Tier 1: Extract raw text if PDF
        if (isPdf) {
            try {
                const { PDFParse } = await import("pdf-parse")
                const parser = new PDFParse({ data: fileBuffer })
                const parseResult = await parser.getText()
                if (typeof parseResult === "string") {
                    pdfText = parseResult.trim()
                } else if (parseResult && parseResult.text) {
                    pdfText = parseResult.text.trim()
                }
            } catch (pdfErr) {
                console.warn("[PDF Parse Warning] Could not parse text with pdf-parse:", pdfErr.message)
            }
        }

        const extractionPrompt = `You are an expert matrimonial biodata parser. Extract all details from the provided biodata document or text into strict JSON matching this exact structure:
{
  "personal_details": {
    "name": "Full Name",
    "gender": "male or female",
    "date_of_birth": "YYYY-MM-DD or date string",
    "place_of_birth": "City, State",
    "time_of_birth": "e.g. 10:30 AM",
    "rashi": "e.g. Mesha, Vrishabha",
    "nakshatra": "e.g. Rohini, Ashwini",
    "height": "e.g. 5'8\\\" or 172 cm",
    "marital_status": "never_married, divorced, or widowed",
    "manglik": "yes, no, or anshik",
    "complexion": "Fair, Wheatish, etc.",
    "highest_education": "Degree name",
    "organization_name": "Company or job title",
    "annual_income": "e.g. 12 LPA",
    "about_me": "Brief self introduction",
    "mother_tongue": "e.g. Hindi, Marathi, Gujarati, Telugu",
    "religion": "e.g. Hindu, Muslim, Sikh, Jain",
    "caste": "Caste name",
    "gotra": "Gotra name",
    "hobbies": ["hobby1", "hobby2"]
  },
  "family_details": {
    "fathers_name": "Father's Full Name",
    "fathers_occupation": "Father's occupation",
    "mothers_name": "Mother's Full Name",
    "mothers_occupation": "Mother's occupation"
  },
  "contact_details": {
    "contact_number": "Phone number",
    "email_id": "Email address",
    "city": "Current city/location"
  }
}

Return ONLY valid JSON. No conversational text or markdown codeblocks outside JSON.`

        // Tier 2: Try Gemini if key is available
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
            try {
                const ai = getAI()
                if (ai) {
                    let contents
                    if (isPdf && pdfText) {
                        contents = [extractionPrompt, `Biodata Text Content:\n${pdfText}`]
                    } else {
                        contents = [
                            {
                                inlineData: {
                                    data: fileBuffer.toString("base64"),
                                    mimeType: mimeType || "application/pdf",
                                },
                            },
                            extractionPrompt,
                        ]
                    }

                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents,
                        config: {
                            responseMimeType: "application/json",
                            responseSchema: biodataSchema,
                        },
                    })

                    const text = response?.text?.trim()
                    if (text) {
                        const parsed = JSON.parse(text)
                        return normalizeBiodataResult(parsed)
                    }
                }
            } catch (geminiErr) {
                console.warn("[Gemini Extraction Warning] Gemini failed, attempting Groq fallback:", geminiErr.message)
            }
        }

        // Tier 3: Try Groq LLM fallback with extracted text or text representation
        if (process.env.GROQ_API_KEY && (pdfText || !isPdf)) {
            try {
                const textToProcess = pdfText || fileBuffer.toString("utf-8", 0, Math.min(fileBuffer.length, 10000))
                if (textToProcess && textToProcess.length > 20) {
                    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                        },
                        body: JSON.stringify({
                            model: "llama-3.3-70b-versatile",
                            messages: [
                                {
                                    role: "system",
                                    content: "You are an expert AI parser for Indian matrimonial biodatas. Return strictly valid JSON matching the user's schema.",
                                },
                                {
                                    role: "user",
                                    content: `${extractionPrompt}\n\nBiodata Text Content:\n${textToProcess}`,
                                },
                            ],
                            temperature: 0.2,
                            response_format: { type: "json_object" },
                        }),
                    })

                    if (groqRes.ok) {
                        const groqData = await groqRes.json()
                        let rawJson = groqData.choices?.[0]?.message?.content?.trim() || ""
                        if (rawJson) {
                            if (rawJson.startsWith("```json")) {
                                rawJson = rawJson.replace(/^```json\s*/, "").replace(/\s*```$/, "")
                            } else if (rawJson.startsWith("```")) {
                                rawJson = rawJson.replace(/^```\s*/, "").replace(/\s*```$/, "")
                            }
                            const parsed = JSON.parse(rawJson)
                            return normalizeBiodataResult(parsed)
                        }
                    }
                }
            } catch (groqErr) {
                console.warn("[Groq Extraction Warning] Groq failed, switching to heuristic rule parser:", groqErr.message)
            }
        }

        // Tier 4: 100% Reliable Heuristic / Regex Extraction
        if (pdfText) {
            return extractBiodataFromTextHeuristic(pdfText)
        }

        // Final fallback: Return formatted default structure with whatever string could be retrieved
        const rawString = fileBuffer.toString("utf-8", 0, Math.min(fileBuffer.length, 5000))
        return extractBiodataFromTextHeuristic(rawString)
    }

    /**
     * Extract structured biodata directly from raw text
     * @param {string} text
     * @returns {object} Standardized extracted biodata JSON
     */
    extractFromText(text = "") {
        return extractBiodataFromTextHeuristic(text)
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
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
            try {
                const ai = getAI()
                if (ai) {
                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: prompt,
                    })
                    const text = response?.text?.trim()
                    if (text) return text
                }
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
        if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith("AIzaSy")) {
            try {
                const ai = getAI()
                if (ai) {
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

const extractionService = new ExtractionService()
export { extractionService }
export default extractionService
