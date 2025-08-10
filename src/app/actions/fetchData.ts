"use server";

import { Logger } from "@/utils/logger";

const logger = new Logger("ServerAction:Requests");

export type request = {
  id: number;
  prompt: string;
  response: string;
  cost: Number;
  latency: Number;
  quality: string;
};

// Simulated database data
const MOCK_REQUESTS: request[] = [
  { id: 1, prompt: "Learn Next.js", response: "Next.js is a React framework...", cost: 0.1, latency: 200, quality: "high" },
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


export async function createRequest(prompt: string, response: string) {

  try {
    logger.info("createRequest - Started creating request", { prompt, response });

    if (!prompt.trim()) {
      logger.warn("createRequest - Empty prompt provided");
      throw new Error("Request prompt cannot be empty");
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would create a new todo in the database
    const newRequest: request = {
      id: Date.now(),
      prompt,
      response: response,
      cost: 0,
      latency: 0,
      quality: "low",
    };

    MOCK_REQUESTS.push(newRequest);

    logger.info("createRequest - Successfully created request", {
      id: newRequest.id,
      prompt: newRequest.prompt,
      response: newRequest.response,
    });

    return MOCK_REQUESTS;
  } catch (error) {
    logger.error("createRequest - Failed to create request", {
      prompt,
      error: error instanceof Error ? error.message : "Unknown error",
    });
    throw error; // Re-throw to handle at UI level
  }
}
