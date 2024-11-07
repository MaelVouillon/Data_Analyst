import OpenAI from 'openai';
import { ChartConfig } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function analyzeData(data: any[], question: string): Promise<{
  answer: string;
  chartConfig?: ChartConfig;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a data analysis assistant. Analyze the provided data and answer questions about it. 
          When appropriate, suggest visualizations by providing a chart configuration in JSON format.
          The chart configuration should include type (bar, line, or pie), title, and data array with name and value properties.`
        },
        {
          role: "user",
          content: `Data: ${JSON.stringify(data)}\n\nQuestion: ${question}`
        }
      ],
      functions: [
        {
          name: "suggest_visualization",
          parameters: {
            type: "object",
            properties: {
              chartConfig: {
                type: "object",
                properties: {
                  type: {
                    type: "string",
                    enum: ["bar", "line", "pie"]
                  },
                  title: {
                    type: "string"
                  },
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        value: { type: "number" }
                      },
                      required: ["name", "value"]
                    }
                  }
                },
                required: ["type", "title", "data"]
              }
            },
            required: ["chartConfig"]
          }
        }
      ],
      function_call: "auto"
    });

    const message = response.choices[0].message;
    let chartConfig: ChartConfig | undefined;

    if (message.function_call && message.function_call.name === "suggest_visualization") {
      const functionArgs = JSON.parse(message.function_call.arguments);
      chartConfig = functionArgs.chartConfig;
    }

    return {
      answer: message.content || "I've analyzed your data and created a visualization.",
      chartConfig
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to analyze data');
  }
}