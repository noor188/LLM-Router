import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const logger = new Logger("API:Example");

const client = new OpenAI({
  apiKey: process.env.openai_api_key,
});

async function generateResponse(type: string, prompt: string){
  logger.info("Generating response", { type, prompt });
  let answer = null;
  const startTime = Date.now();
  if(type == "coding"){
    answer = await client.chat.completions.create({
      model:"gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ]

    });
  }else if(type === "general_question"){
    answer = await client.chat.completions.create({
      model:"gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ]

    });
    
} else if(type == "writing"){
     answer = await client.chat.completions.create({
      model:"gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ],
      max_tokens: 1024,
    });
  } 

  const endTime = Date.now();
  const latency = endTime - startTime;
  logger.info("Response generated", answer);
  return { 
    content: answer.choices[0].message.content,
    tokensUsed: answer.usage.total_tokens || 0,
    latency: latency / 1000, // convert to seconds
    model: answer.model,
  };
}


export async function POST(request: Request){

  try{
    logger.info("POST /api/router - Request started");
    const userRequest = await request.json();
    logger.debug("Request body", { userRequest });

    // process data here LLM routing logic
    const prompt = userRequest.newRequest;
    logger.info("POST /api/router - Processing prompt",  prompt);

    // classify the request type
    const type = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
        {
            role: "user",
            content: `You are an expert classifier. Based on the user's prompt below, classify it as either coding, general_question, or writing. 
            
            <UserPrompt>
            ${prompt}
            </UserPrompt>

            Your response should be in json format like this:

          {
            "promptType": "coding" | "general_question" | "writing"
          }`
        },
    ],
    });
    
    const classificationText = type.choices[0].message.content;
    const classification = JSON.parse(classificationText || '{"promptType": "unknown"}');

    logger.info("POST /api/router - Classification result", { classification });
    
    let response = await generateResponse(classification.promptType || "", prompt);

    logger.info("POST /api/router - Response generated", { response });

    return NextResponse.json(response);
  } catch (error){
    logger.error("POST /router/LLMRouter - Request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
