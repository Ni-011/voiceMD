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
    const ans = JSON.parse(
      result.response.text().replace(/```/g, "").replace(/json/g, "")
    );
    return ans;
  } catch (e) {
    console.error("Sorry could not parse the reponse");
    throw e;
  }
}

// generate(marathi_promt, prompt_info);

// console.log(ans);
