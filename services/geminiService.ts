import { GoogleGenAI, Schema, Type } from "@google/genai";
import { Message, ThemeConfig } from "../types";
import { DEFAULT_THEME } from "../constants";

// WARNING: In a production app, never expose API keys on the client.
const API_KEY = "";

const ai = new GoogleGenAI({ apiKey: API_KEY });

// --- Chat Logic ---

const WIDGET_SYSTEM_INSTRUCTION = `
You are an intelligent chatbot assistant. Your goal is to help the user.
You can respond with standard text, or you can trigger specific UI widgets when appropriate.

Available Widgets:
1. 'date_picker': Use when the user wants to schedule something.
2. 'quick_replies': Use when the user needs to choose from a few simple options (Yes/No, Categories).
3. 'dropdown': Use for selecting from a long list (like countries or categories).
4. 'carousel': Use when showing products, places, or visual items.
5. 'form': Use when you need to collect multiple pieces of data (name, email, etc.).
6. 'feedback': Use when you want to ask the user for a rating or satisfaction score.
7. 'file_upload': Use when you need the user to upload a document or image.

Response Format:
You MUST return a JSON object (no markdown formatting).
{
  "type": "text" | "date_picker" | "quick_replies" | "dropdown" | "carousel" | "form" | "feedback" | "file_upload",
  "content": "The text message to display",
  "widgetData": { ... specific data for the widget ... }
}

Examples:
- User: "Book a meeting."
  → { "type": "date_picker", "content": "Select a meeting date:", "widgetData": { "title": "Pick a date" } }

- User: "Do you like pizza?"
  → { "type": "quick_replies", "content": "Choose an answer:", "widgetData": { "options": ["Yes", "No"] } }

- User: "Pick a country from Asia"
  → { "type": "dropdown", "content": "Select a country:", "widgetData": { "title": "Country", "options": [{"label":"India","value":"IN"},{"label":"Japan","value":"JP"}] } }

- User: "Show me mobile phones"
  → { "type": "carousel", "content": "Here are some options:", "widgetData": { "items": [ { "title": "iPhone 15", "description": "Latest model", "imageUrl": "https://..." }, { "title": "Samsung S24", "description": "New release", "imageUrl": "https://..." } ] } }

- User: "Fill my contact form"
  → { "type": "form", "content": "Enter your information:", "widgetData": { "title": "Contact Info", "fields": [ { "name": "name", "label": "Full Name", "type": "text" }, { "name": "email", "label": "Email", "type": "email" } ] } }

- User: "Rate our service"
  → { "type": "feedback", "content": "How was your experience?", "widgetData": { "title": "Rate us" } }

- User: "Upload my ID"
  → { "type": "file_upload", "content": "Please upload your ID:", "widgetData": { "allowedTypes": ["image/*", ".pdf"] } }
  `;

export const sendMessageToGemini = async (
  history: Message[],
  userMessage: string
): Promise<{ type: string; content: string; widgetData?: any }> => {
  if (!API_KEY) {
    return {
      type: "text",
      content: "Error: API Key is missing. Check your environment variables.",
    };
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: WIDGET_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
      },
      history: history.map((h) => ({
        role: h.role,
        parts: [{ text: h.content }],
      })),
    });

    const result = await chat.sendMessage({ message: userMessage });
    const responseText = result.text;

    if (!responseText) throw new Error("No response");

    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return {
      type: "text",
      content: "I'm having trouble connecting right now.",
    };
  }
};

// --- Theme Generation Logic ---

const THEME_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    colors: {
      type: Type.OBJECT,
      properties: {
        primary: { type: Type.STRING },
        secondary: { type: Type.STRING },
        accent: { type: Type.STRING },
        neutral: { type: Type.STRING },
        surface: { type: Type.STRING },
        textPrimary: { type: Type.STRING },
        textInverse: { type: Type.STRING },
      },
      required: ["primary", "secondary", "neutral", "surface", "textPrimary"],
    },
    shapes: {
      type: Type.OBJECT,
      properties: {
        borderRadius: { type: Type.INTEGER },
        hasShadow: { type: Type.BOOLEAN },
      },
    },
    // We simplify component schema for AI generation to avoid token limits, logic below fills gaps
    components: {
      type: Type.OBJECT,
      properties: {
        header: {
          type: Type.OBJECT,
          properties: {
            backgroundColor: { type: Type.STRING },
            textColor: { type: Type.STRING },
          },
        },
        botMessage: {
          type: Type.OBJECT,
          properties: {
            backgroundColor: { type: Type.STRING },
            textColor: { type: Type.STRING },
            accentColor: { type: Type.STRING },
          },
        },
        userMessage: {
          type: Type.OBJECT,
          properties: {
            backgroundColor: { type: Type.STRING },
            textColor: { type: Type.STRING },
          },
        },
      },
    },
  },
};

export const generateThemeFromImage = async (
  base64Image: string
): Promise<ThemeConfig> => {
  if (!API_KEY) throw new Error("API Key missing");

  const base64Data = base64Image.replace(
    /^data:image\/(png|jpeg|jpg|webp);base64,/,
    ""
  );

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Data,
            },
          },
          {
            text: "Analyze this image. Create a UI theme JSON. Extract dominant colors. If image is dark, ensure text is light. Return JSON.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: THEME_SCHEMA,
      },
    });

    const themeJson = JSON.parse(response.text || "{}");

    // Merge with default to ensure complete structure
    return {
      ...DEFAULT_THEME,
      colors: { ...DEFAULT_THEME.colors, ...themeJson.colors },
      shapes: { ...DEFAULT_THEME.shapes, ...themeJson.shapes },
      components: {
        ...DEFAULT_THEME.components,
        ...themeJson.components,
        header: {
          ...DEFAULT_THEME.components.header,
          ...themeJson.components?.header,
        },
        botMessage: {
          ...DEFAULT_THEME.components.botMessage,
          ...themeJson.components?.botMessage,
          accentColor:
            themeJson.components?.botMessage?.accentColor ||
            themeJson.components?.botMessage?.backgroundColor || // fallback
            DEFAULT_THEME.components.botMessage.accentColor ||
            DEFAULT_THEME.components.botMessage.backgroundColor, // final fallback
        },
        userMessage: {
          ...DEFAULT_THEME.components.userMessage,
          ...themeJson.components?.userMessage,
        },
      },
      // Reset specific widget overrides on new generation to let global colors take over
      widgets: DEFAULT_THEME.widgets,
    };
  } catch (error) {
    console.error("Theme Gen Error:", error);
    throw error;
  }
};
