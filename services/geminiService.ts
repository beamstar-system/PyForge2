import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedProject, GenerationConfig } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
// CRITICAL: The API key must be strictly obtained from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateCodebase = async (
  prompt: string,
  config: GenerationConfig
): Promise<GeneratedProject> => {
  try {
    const finalPrompt = `
      Project Request: ${prompt}
      
      Configuration:
      - Include Unit Tests: ${config.includeTests}
      - Include Dockerfile: ${config.includeDocker}
      
      Generate a complete Python project structure for this request.
    `;

    const response = await ai.models.generateContent({
      model: config.model,
      contents: finalPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            projectName: {
              type: Type.STRING,
              description: "A creative and relevant snake_case name for the project folder",
            },
            description: {
              type: Type.STRING,
              description: "A short summary of what the generated code does",
            },
            files: {
              type: Type.ARRAY,
              description: "List of files in the project",
              items: {
                type: Type.OBJECT,
                properties: {
                  path: {
                    type: Type.STRING,
                    description: "Relative file path (e.g., 'src/app.py', 'requirements.txt')",
                  },
                  content: {
                    type: Type.STRING,
                    description: "The raw source code or content of the file",
                  },
                },
                required: ["path", "content"],
              },
            },
          },
          required: ["projectName", "description", "files"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No response generated from the model.");
    }

    const projectData = JSON.parse(response.text) as GeneratedProject;
    return projectData;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};