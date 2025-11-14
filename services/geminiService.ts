
import { GoogleGenAI, Type } from "@google/genai";
import type { EmailRequestData, GeneratedEmailContent, EmailStyle, EmailScanResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
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
  }
};

const scanResultSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING, description: "A brief, one-sentence summary of the email's content." },
            intent: { 
                type: Type.STRING, 
                description: "The primary intent of the email. Must be one of: Confirmation, Rejection, Question, Scheduling, Incomplete, Other." 
            },
            confidence: { type: Type.NUMBER, description: "A confidence score from 0.0 to 1.0 for the detected intent." },
            suggestedReply: {
                type: Type.OBJECT,
                properties: {
                    subject: { type: Type.STRING, description: "A suitable subject line for the reply, often prefixed with 'Re:'." },
                    body: { type: Type.STRING, description: "A context-aware, professionally drafted reply that directly addresses the original email's content." }
                },
                required: ['subject', 'body']
            }
        },
        // FIX: Enclosed 'confidence' and 'suggestedReply' in quotes to treat them as string literals, resolving the 'Cannot find name' error.
        required: ['summary', 'intent', 'confidence', 'suggestedReply']
    }
};


const generateEmailWithSchema = async (prompt: string, style: EmailStyle): Promise<GeneratedEmailContent[]> => {
  const fullPrompt = `
    You are an expert email copywriter. Your task is to generate TWO distinct professional, ready-to-send email variations based on a user's request.

    **Instructions:**
    1.  Generate a JSON array containing exactly two email objects. Each object must strictly adhere to the provided schema.
    2.  The two variations should explore different angles or tones while fulfilling the same core request. For example, one could be more direct and concise, while the other is more descriptive and friendly.
    3.  Each variation must have a clear and engaging subject line.
    4.  Each email body must be well-structured, starting with an appropriate greeting, communicating the core message, and ending with a professional closing.
    5.  Adhere strictly to the specified style for BOTH variations, but interpret it slightly differently for each to create variety.

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
  const generatedContent: GeneratedEmailContent[] = JSON.parse(jsonText);
  
  if (!Array.isArray(generatedContent) || generatedContent.length === 0 || !generatedContent[0].subject || !generatedContent[0].body) {
      throw new Error("Invalid response format from API.");
  }

  return generatedContent;
};

const generateEmailWithSearch = async (prompt: string, style: EmailStyle): Promise<GeneratedEmailContent[]> => {
  const fullPrompt = `
    You are an expert email copywriter. Your task is to generate TWO distinct professional, ready-to-send email variations based on a user's request, using Google Search to find up-to-date information if needed.

    **Instructions:**
    1.  Format your response with each variation clearly separated. Use "---VARIATION 1---" and "---VARIATION 2---" as separators.
    2.  For each variation, provide the subject on one line and the body on a new line, like this:
        Subject: [Your Subject Here]
        Body: [Your Email Body Here]
    3.  The two variations should explore different angles or tones.
    4.  Adhere strictly to the specified style for BOTH variations.

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
  
  const sources: { uri: string; title: string }[] = [];
  response.candidates?.[0]?.groundingMetadata?.groundingChunks?.forEach(
    (chunk) => {
      if (chunk.web?.uri && chunk.web?.title) {
        sources.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
    }
  );
  const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());
  const sourcesProp = { sources: uniqueSources.length > 0 ? uniqueSources : undefined };

  const variations = text.split(/---\s*VARIATION\s*\d+\s*---/i).filter(v => v.trim());

  if (variations.length < 2) {
    const subjectMatch = text.match(/^Subject:\s*(.*)/m);
    const bodyMatch = text.match(/\nBody:\s*([\s\S]*)/m);
    const subject = subjectMatch ? subjectMatch[1].trim() : "Subject Not Generated";
    const body = bodyMatch ? bodyMatch[1].trim() : text.replace(/^Subject:\s*(.*)/m, '').trim();
    return [{ subject, body, ...sourcesProp }];
  }

  const emails: GeneratedEmailContent[] = variations.map(variationText => {
    const subjectMatch = variationText.match(/^Subject:\s*(.*)/m);
    const bodyMatch = variationText.match(/\nBody:\s*([\s\S]*)/m);
    const subject = subjectMatch ? subjectMatch[1].trim() : "Subject Not Generated";
    const body = bodyMatch ? bodyMatch[1].trim() : variationText.replace(/^Subject:\s*(.*)/m, '').trim();
    return { subject, body, ...sourcesProp };
  }).filter(e => e.subject !== "Subject Not Generated" || e.body.length > 0);
  
  if (emails.length === 0) {
      throw new Error("Failed to parse email variations from API response.");
  }

  return emails;
};

export const generateEmail = async (formData: EmailRequestData): Promise<GeneratedEmailContent[]> => {
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


export const scanEmail = async (subject: string, body: string): Promise<EmailScanResult[]> => {
  const fullPrompt = `
    You are an AI assistant that analyzes incoming emails and drafts smart replies.
    Your task is to analyze the provided email and generate a JSON array with TWO distinct reply variations.

    **Instructions:**
    1.  Thoroughly analyze the email's subject and body.
    2.  For BOTH variations, determine the summary, intent, and confidence. The summary, intent, and confidence should be identical for both objects in the array.
    3.  The \`intent\` must be one of the following exact values: 'Confirmation', 'Rejection', 'Question', 'Scheduling', 'Incomplete', 'Other'.
    4.  The \`confidence\` must be a number between 0.0 and 1.0.
    5.  Draft two different \`suggestedReply\` variations. They should be context-aware and address the original email's content. For example, one could be more formal, the other more friendly.
    6.  The entire output must be a valid JSON array conforming to the provided schema.

    **Incoming Email to Analyze:**
    - **Subject:** "${subject}"
    - **Body:** "${body}"
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: fullPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: scanResultSchema,
        temperature: 0.7,
      },
    });

    const jsonText = response.text.trim();
    const scanResults: EmailScanResult[] = JSON.parse(jsonText);

    if (!Array.isArray(scanResults) || scanResults.length === 0 || !scanResults[0].suggestedReply) {
        throw new Error("Invalid response format from API for email scan.");
    }
    
    return scanResults;
  } catch (error) {
    console.error("Error scanning email with Gemini:", error);
    throw new Error("Failed to communicate with the AI model for scanning.");
  }
};
