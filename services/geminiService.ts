
import { GoogleGenAI, Type } from "@google/genai";
import type { EmailRequestData, GeneratedEmailContent, EmailStyle } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    subject: {
      type: Type.STRING,
      description: "A compelling, concise, and optimized subject line for the email."
    },
    body: {
      type: Type.STRING,
      description: "The full body of the email, formatted professionally with paragraphs and a clear sign-off. Do not include a placeholder for the sender's name."
    }
  },
  required: ['subject', 'body']
};

const generateEmailWithSchema = async (prompt: string, style: EmailStyle): Promise<GeneratedEmailContent> => {
  const fullPrompt = `
    You are an expert email copywriter. Your task is to generate a professional, ready-to-send email based on a user's request.

    **Instructions:**
    1.  Generate a JSON object that strictly adheres to the provided schema.
    2.  The subject line should be clear and engaging.
    3.  The email body must be well-structured, starting with an appropriate greeting, communicating the core message, and ending with a professional closing.
    4.  Adhere strictly to the specified style.

    **Email Details:**
    - **User's Request:** "${prompt}"
    - **Desired Style:** ${style}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: responseSchema,
      temperature: 0.7,
    },
  });

  const jsonText = response.text.trim();
  const generatedContent: GeneratedEmailContent = JSON.parse(jsonText);
  
  if (!generatedContent.subject || !generatedContent.body) {
      throw new Error("Invalid response format from API.");
  }

  return generatedContent;
};

const generateEmailWithSearch = async (prompt: string, style: EmailStyle): Promise<GeneratedEmailContent> => {
  const fullPrompt = `
    You are an expert email copywriter. Your task is to generate a professional, ready-to-send email based on a user's request, using Google Search to find up-to-date information if needed.

    **Instructions:**
    1.  Format your response with the subject on one line and the body on a new line, like this:
        Subject: [Your Subject Here]
        Body: [Your Email Body Here]
    2.  The subject line should be clear and engaging.
    3.  The email body must be well-structured, starting with an appropriate greeting, communicating the core message, and ending with a professional closing.
    4.  Adhere strictly to the specified style.

    **Email Details:**
    - **User's Request:** "${prompt}"
    - **Desired Style:** ${style}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: fullPrompt,
    config: {
      tools: [{googleSearch: {}}],
      temperature: 0.7,
    },
  });

  const text = response.text;
  
  // Basic parsing to extract subject and body
  const subjectMatch = text.match(/^Subject:\s*(.*)/m);
  const bodyMatch = text.match(/\nBody:\s*([\s\S]*)/m);

  const subject = subjectMatch ? subjectMatch[1].trim() : "Subject Not Generated";
  const body = bodyMatch ? bodyMatch[1].trim() : text.replace(/^Subject:\s*(.*)/m, '').trim();

  // FIX: Replaced reduce with forEach to resolve a TypeScript type inference error when processing grounding chunks.
  const sources: { uri: string; title: string }[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach(
    (chunk) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    }
  );
  
  const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

  return { subject, body, sources: uniqueSources.length > 0 ? uniqueSources : undefined };
};

export const generateEmail = async (formData: EmailRequestData): Promise<GeneratedEmailContent> => {
  const { prompt, style, useSearch } = formData;
  try {
    if (useSearch) {
      return await generateEmailWithSearch(prompt, style);
    } else {
      return await generateEmailWithSchema(prompt, style);
    }
  } catch (error) {
    console.error("Error generating email with Gemini:", error);
    throw new Error("Failed to communicate with the AI model.");
  }
};
