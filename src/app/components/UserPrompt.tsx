"use client";

import { useState } from "react";
import { useTransition } from "react";
import type { request } from "../actions/fetchData";
import { createRequest } from "../actions/fetchData";
import { Logger } from "@/utils/logger";

const logger = new Logger("ClientAction:UserPrompt");


type RequestsProps = {
  initialRequests: request[];
};

export function UserPrompt({ initialRequests }: RequestsProps) {
  const [requests, setRequests] = useState<request[]>(initialRequests);
  const [newRequest, setNewRequest] = useState("");
  const [isPending, startTransition] = useTransition();  

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newRequest.trim()) return;
    let generatedResponse;
    

    try{
      
      logger.info("Sending request to API", { newRequest }); 

      const response = await fetch("/api/router", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newRequest }),
    });

      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      generatedResponse = await response.json();
      
    } catch(error){
      console.error('Error:', error);
      generatedResponse = {
        content: "Error processing request. Please try again.",
        usage: 0,
        latency: 0,
        model: "error",
      };
    }
    
    logger.info("Received response from API", { generatedResponse });
    // Optimistic update
    const optimisticRequest = {
      id: Date.now(),
      prompt: newRequest,
      response: generatedResponse.content,
      tokensUsed: generatedResponse.tokensUsed,
      latency: generatedResponse.latency,
      model: generatedResponse.model,
    };
    console.log("optimisticRequest:", optimisticRequest);

    setRequests(prev => [...prev, optimisticRequest]);
    setNewRequest("");

    try {
      startTransition(async () => {
        logger.info("Creating request in the database", { optimisticRequest });
        const updatedRequests = await createRequest(optimisticRequest);
        setRequests(updatedRequests);
      });
    } catch (error) {
      // Revert optimistic update on error
      setRequests(prev => prev.filter(todo => todo.id !== optimisticRequest.id));
      console.error("Failed to create request:", error);
    }
  }

  return (
    <div className="w-full">
      {/* Add prompt Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={newRequest}
            onChange={e => setNewRequest(e.target.value)}
            placeholder="Add a new prompt..."
            className="flex-1 rounded-lg bg-white/[0.05] px-4 py-2 text-sm text-white placeholder-zinc-400 ring-1 ring-white/[0.1] focus:outline-none focus:ring-2 focus:ring-white/[0.3]"
          />
          <button
            type="submit"
            disabled={!newRequest.trim() || isPending}
            className="rounded-lg bg-white/[0.1] px-4 py-2 text-sm font-medium text-white hover:bg-white/[0.15] focus:outline-none focus:ring-2 focus:ring-white/[0.3] disabled:opacity-50"
          >
            Submit
          </button>
        </div>
      </form>

      {/* Response */}
      <ul className="space-y-2">
        {requests.map(request => (
          <li
            key={request.id}
            className="flex items-center gap-3 rounded-lg bg-white/[0.05] p-4 ring-1 ring-white/[0.1]"
          >
            <span
              className={"flex-1 text-sm text-white"}
            >
              {request.prompt}
            </span>
            <span className="block text-xs text-zinc-500">{request.response}</span>
            <span className="block text-xs text-zinc-500">Model:{request.model}</span>
            <span className="block text-xs text-zinc-500">Tokens used: {String(request.tokensUsed)}</span>
            <span className="block text-xs text-zinc-500">Latency: {String(request.latency)}</span>
          </li>
        ))}
      </ul>

      {/* Empty State */}
      {requests.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-500">No prompts yet. Add one above!</p>
        </div>
      )}
    </div>
  );
}
