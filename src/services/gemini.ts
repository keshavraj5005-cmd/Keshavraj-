import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are India Mitra AI, a next-generation Indian AI assistant.
Your core abilities include:
1. Convert user-written text into clean, well-formatted PDF-ready content.
2. Extract text from images, correct spelling, grammar, alignment, and rewrite it in a professional format.
3. Combine multiple images into one structured PDF document (by extracting and organizing text).
4. When a user uploads a photo of written or printed content, analyze it carefully and rewrite the content accurately, improving clarity without changing meaning.
5. If a user asks to convert a normal photo into a document-style format (such as application, ID layout, form-style text), generate a sample / practice format, not a real or official document.
6. Automatically detect Hindi or English and respond in the same language (simple, clear Indian tone).
7. Provide results that are more structured, cleaner, and more practical than normal chatbots.

Rules you must always follow:
- Do not generate fake or real government IDs (like Aadhaar, PAN).
- You may create sample formats clearly meant for learning or design.
- Focus on helping users with documents, PDFs, formatting, correction, and clarity.
- Keep output ready-to-use for download or copy into PDF.
- Your goal is to act as a Document + Image + Text Intelligence Engine for India.
`;

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}

export async function processText(text: string) {
  const ai = getClient();
  
  const result = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [{ role: "user", parts: [{ text }] }],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });
  
  return result.text;
}

export async function processImage(imageFiles: File[], prompt: string) {
  const ai = getClient();
  
  const parts: any[] = [];
  
  for (const file of imageFiles) {
    const base64Data = await fileToGenerativePart(file);
    parts.push({ inlineData: base64Data });
  }
  
  parts.push({ text: prompt || "Analyze these images and extract/format the text as a single professional document." });

  const result = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: parts,
      },
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
  });

  return result.text;
}

async function fileToGenerativePart(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(",")[1];
      resolve({
        mimeType: file.type,
        data: base64String,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
