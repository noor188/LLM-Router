"use server";

import { Logger } from "@/utils/logger";

const logger = new Logger("ServerAction:Requests");

export type request = {
  id: number;
  prompt: string;
  response: string;
  tokensUsed: Number;
  latency: Number;
  model: string;
};

// Simulated database data
const MOCK_REQUESTS: request[] = [
  { id: 1, prompt: "Learn Next.js", response: "Next.js is a React framework...", tokensUsed: 0.1, latency: 200, quality: "high" },
];

export async function fetchRequests() {
  try {
    logger.info("fetchRequests - Started fetching requests");

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    logger.info("fetchRequests - Successfully fetched requests", {
      count: MOCK_REQUESTS.length,
    });

    return MOCK_REQUESTS;
  } catch (error) {
    logger.error("fetchRequests - Failed to fetch requests", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error; // Re-throw to handle at UI level
  }
}


export async function createRequest(response: request) {

  try {
    logger.info("createRequest - Started creating request", { response });

    if (!response.prompt.trim()) {
      logger.warn("createRequest - Empty prompt provided");
      throw new Error("Request prompt cannot be empty");
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would create a new todo in the database
    const newRequest: request = {
      id: Date.now(),
      prompt: response.prompt,
      response: response.response,
      tokensUsed: response.tokensUsed,
      latency: response.latency,
      model: response.model,
    };

    MOCK_REQUESTS.push(newRequest);

    logger.info("createRequest - Successfully created request", { newRequest });

    return MOCK_REQUESTS;
  } catch (error) {
    logger.error("createRequest - Failed to create request", {
      prompt,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error; // Re-throw to handle at UI level
  }
}
