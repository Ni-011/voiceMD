import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

export interface patientIn {
  name: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  medicalHistory: {
    disease: string[];
    active_med: string[];
    BP: string;
  };
}

export async function generate(prompt: string, info: string) {
  try {
    const result = await model.generateContent(prompt + "\n\n" + info);
    const responseText = result.response.text();

    // Try to extract JSON content from the response
    let jsonContent = responseText;

    // Remove markdown code blocks if present
    jsonContent = jsonContent.replace(/```(?:json)?\s*|\s*```/g, "");

    // Try to find JSON object in the text (anything between { and })
    const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonContent = jsonMatch[0];
    }

    try {
      return JSON.parse(jsonContent);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError);
      console.log("Response text:", responseText);

      // As a fallback, return a minimal valid structure
      return {
        medicalHistory: {},
        diagnosis: [],
        prescriptions: [],
        precautions: [],
        condition: "",
        status: "Active",
        symptoms: "",
      };
    }
  } catch (e) {
    console.error("Error generating content:", e);
    throw e;
  }
}

// generate(marathi_promt, prompt_info);

// console.log(ans);
