"use client";

import { useState } from "react";
import { aiChat } from "@/lib/api";
import ChatInterface from "@/components/ChatInterface";
import MediaGrid from "@/components/MediaGrid";
import SubscribeCard from "@/components/SubscribeCard";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"chat" | "roster" | "subscribe">("chat");

  return (
    <main className="min-h-screen bg-gradient-to-br from-dmf-primary via-dmf-accent to-dmf-primary p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-dmf-secondary mb-2">DMF Music Platform</h1>
          <p className="text-gray-300">Distribute, monetize, and manage your music with AI</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 justify-center mb-8">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-6 py-3 rounded font-semibold transition ${
              activeTab === "chat"
                ? "bg-dmf-secondary text-dmf-primary"
                : "bg-dmf-accent text-white hover:bg-dmf-secondary/20"
            }`}
          >
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-6 py-3 rounded font-semibold transition ${
              activeTab === "roster"
                ? "bg-dmf-secondary text-dmf-primary"
                : "bg-dmf-accent text-white hover:bg-dmf-secondary/20"
            }`}
          >
            Roster
          </button>
          <button
            onClick={() => setActiveTab("subscribe")}
            className={`px-6 py-3 rounded font-semibold transition ${
              activeTab === "subscribe"
                ? "bg-dmf-secondary text-dmf-primary"
                : "bg-dmf-accent text-white hover:bg-dmf-secondary/20"
            }`}
          >
            Subscribe
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === "chat" && <ChatInterface />}
        {activeTab === "roster" && <MediaGrid />}
        {activeTab === "subscribe" && <SubscribeCard />}
      </div>
    </main>
  );
}
