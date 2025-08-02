import { GoogleGenAI, Type } from "@google/genai";
import type { BeautyRating } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    rating: {
      type: Type.NUMBER,
      description: "Un punteggio di bellezza da 1 a 10, dove 1 è il minimo e 10 il massimo."
    },
    title: {
      type: Type.STRING,
      description: "Un titolo creativo e positivo per il look della persona, in italiano."
    },
    analysis: {
      type: Type.STRING,
      description: "Un'analisi di 2-3 frasi, positiva, giocosa e rispettosa delle caratteristiche del viso. Deve essere incoraggiante e divertente. Scritta in italiano."
    }
  },
  required: ["rating", "title", "analysis"]
};

export const analyzeImage = async (base64Image: string): Promise<BeautyRating> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1],
    },
  };

  const textPart = {
    text: "Analizza il viso in questa foto. Fornisci una valutazione di bellezza da 1 a 10. Fornisci anche una breve analisi positiva e giocosa e un titolo creativo per il loro look. Sii rispettoso e concentrati sugli attributi positivi. Rispondi in formato JSON. La lingua della risposta deve essere l'italiano.",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.8,
      }
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);
    
    // Basic validation
    if (typeof parsedJson.rating !== 'number' || typeof parsedJson.analysis !== 'string' || typeof parsedJson.title !== 'string') {
        throw new Error("Risposta API non valida.");
    }

    return parsedJson as BeautyRating;

  } catch (error) {
    console.error("Errore durante la chiamata all'API Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`Impossibile analizzare l'immagine: ${error.message}`);
    }
    throw new Error("Impossibile analizzare l'immagine a causa di un errore sconosciuto.");
  }
};
