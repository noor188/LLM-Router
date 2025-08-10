import Image from "next/image";
import { UserPrompt } from "./components/UserPrompt";
import { fetchRequests } from "./actions/fetchData";

export default async function Home() {
  const Requests = await fetchRequests();

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              LLM Router
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              This LLM router automatically routes requests to the most cost-effective LLM based on task type and prefernece needs.
            </p>            
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-16">
          <div className="overflow-hidden rounded-2xl bg-white/[0.05] shadow-xl ring-1 ring-white/[0.1]">
            <div className="p-6">
              <UserPrompt initialRequests={Requests} />
            </div>
          </div>                
        </div>
      </div>
    </div>
  );
}
