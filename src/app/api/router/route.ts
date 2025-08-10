import { NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import dotenv from "dotenv";

dotenv.config();
import OpenAI from "openai";

const logger = new Logger("API:Example");

const client = new OpenAI({
  apiKey: process.env.openai_api_key,
});


export async function GET(request: Request) {
  try {
    logger.info("GET /router/LLMRouter - Request started");

    // Log request details
    const url = new URL(request.url);
    logger.debug("Request details", {
      method: request.method,
      path: url.pathname,
      searchParams: Object.fromEntries(url.searchParams),
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info("GET /router/LLMRouter - Request completed successfully", {
      itemCount: 0,
    });

    return NextResponse.json([]);
  } catch (error) {
    logger.error("GET /router/LLMRouter - Request failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }  
}

async function generateResponse(type: string, prompt: string){
  logger.info("Generating response", { type, prompt });
  logger.info("prompt type", { type: (typeof type) });
  if(type == "coding"){
    const code = await client.chat.completions.create({
      model:"gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ]

    });
    return code.choices[0].message.content;
  }else if(type === "general_question"){
    const answer = await client.chat.completions.create({
      model:"gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ]

    });
    let answerText = answer.choices[0].message.content;
    logger.info("Answer generated", { answerText });
    return answer.choices[0].message.content;
} else if(type == "writing"){
    const text = await client.chat.completions.create({
      model:"gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        }
      ]
    });
    return text.choices[0].message.content;
  } 
}


export async function POST(request: Request){

  try{
    logger.info("POST /api/router - Request started");
    const userRequest = await request.json();
    logger.debug("Request body", { userRequest });

    // process data here LLM routing logic
    const prompt = userRequest.newRequest;
    logger.info("POST /api/router - Processing prompt", { prompt });

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
