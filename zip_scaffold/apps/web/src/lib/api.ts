import axios, { AxiosInstance } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Chat with AI via the backend proxy
 * @param model - Model name (gpt-4o, gpt-4o-mini, etc.)
 * @param messages - Chat messages array
 * @returns AI response
 */
export async function aiChat(model: string, messages: any[]) {
  try {
    const response = await api.post("/api/googleai", {
      model,
      messages,
    });
    return response.data;
  } catch (error) {
    console.error("AI Chat Error:", error);
    throw error;
  }
}

/**
 * Get artist profile and metadata
 * @param artistId - Artist ID
 * @returns Artist profile + metadata
 */
export async function getArtist(artistId: string) {
  try {
    const response = await api.get(`/api/artist/${artistId}`);
    return response.data;
  } catch (error) {
    console.error("Get Artist Error:", error);
    throw error;
  }
}

/**
 * Subscribe user to a plan
 * @param userId - User ID
 * @param plan - Plan name (free, basic, pro, enterprise)
 * @returns Subscription result
 */
export async function subscribe(userId: string, plan: string) {
  try {
    const response = await api.post("/api/subscribe", {
      userId,
      plan,
    });
    return response.data;
  } catch (error) {
    console.error("Subscribe Error:", error);
    throw error;
  }
}

/**
 * Get current user profile
 * @returns Current user data
 */
export async function getCurrentUser() {
  try {
    const response = await api.get("/api/me");
    return response.data;
  } catch (error) {
    console.error("Get Current User Error:", error);
    throw error;
  }
}

/**
 * Health check
 * @returns API health status
 */
export async function healthCheck() {
  try {
    const response = await api.get("/api/health");
    return response.data;
  } catch (error) {
    console.error("Health Check Error:", error);
    throw error;
  }
}

export default api;
