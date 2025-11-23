"use client";

import { useState } from "react";
import { aiChat } from "@/lib/api";
import { Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await aiChat("gpt-4o-mini", [
        ...messages,
        userMessage,
      ]);

      if (response.success) {
        const assistantMessage: Message = {
          role: "assistant",
          content: response.choices[0]?.message?.content || "No response",
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dmf-accent rounded-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-dmf-secondary mb-4">AI Assistant</h2>

      {/* Chat Display */}
      <div className="bg-dmf-primary rounded p-4 mb-4 h-96 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400">
            <p>Start a conversation with your AI assistant</p>
            <p className="text-sm mt-2">Ask about your music, royalties, or distribution</p>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded ${
                msg.role === "user"
                  ? "bg-dmf-secondary text-dmf-primary"
                  : "bg-gray-700 text-white"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-700 text-white px-4 py-2 rounded animate-pulse">
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-dmf-primary text-white px-4 py-3 rounded outline-none focus:ring-2 focus:ring-dmf-secondary"
          disabled={loading}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-dmf-secondary text-dmf-primary px-6 py-3 rounded font-semibold hover:bg-dmf-secondary/90 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
