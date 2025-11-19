/**
 * DMF API Client
 * Shared across all frontends (Google AI Studio, Bolt, Gemini, OpenAI, VS Code)
 * Handles routing through DMF Gateway with automatic auth + error handling
 */

export class DMFApiClient {
  private baseUrl: string;
  private authToken?: string;

  constructor(baseUrl?: string, authToken?: string) {
    // Support Vite env (VITE_API_BASE_URL) and Node env (DMF_API_BASE_URL)
    const envUrl = (globalThis as any).import?.meta?.env?.VITE_API_BASE_URL || 
                   (typeof process !== "undefined" ? process.env.DMF_API_BASE_URL : undefined);
    this.baseUrl = baseUrl || envUrl || "http://localhost:5000";
    this.authToken = authToken;
  }

  /**
   * Set auth token (e.g., Firebase ID token)
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Generic API request handler
   */
  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers || {});

    // Always add Content-Type
    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    // Add auth token if available
    if (this.authToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.authToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = new Error(`DMF API Error: ${response.status}`);
      (error as any).status = response.status;
      (error as any).url = url;
      throw error;
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      return response.json();
    }

    return response.text() as any;
  }

  // ============ CATALOG ENDPOINTS ============

  async getCatalogReleases(): Promise<any[]> {
    return this.request("/catalog/releases");
  }

  async getCatalogRelease(id: string): Promise<any> {
    return this.request(`/catalog/releases/${id}`);
  }

  async getCatalogTracks(): Promise<any[]> {
    return this.request("/catalog/tracks");
  }

  async getCatalogTrack(id: string): Promise<any> {
    return this.request(`/catalog/tracks/${id}`);
  }

  // ============ BRAIN ENDPOINTS ============

  async scoreTrack(trackData: any): Promise<any> {
    return this.request("/brain/catalog/score", {
      method: "POST",
      body: JSON.stringify(trackData)
    });
  }

  async getRecommendations(catalogData: any): Promise<any> {
    return this.request("/brain/catalog/recommendations", {
      method: "POST",
      body: JSON.stringify(catalogData)
    });
  }

  async analyzeCatalog(catalogData: any): Promise<any> {
    return this.request("/brain/catalog/analyze", {
      method: "POST",
      body: JSON.stringify(catalogData)
    });
  }

  async generateInsights(analysisData: any): Promise<any> {
    return this.request("/brain/catalog/insights", {
      method: "POST",
      body: JSON.stringify(analysisData)
    });
  }

  // ============ DISTRIBUTOR ENDPOINTS ============

  async getReleaseQuote(releaseData: any): Promise<any> {
    return this.request("/distributor/release/quote", {
      method: "POST",
      body: JSON.stringify(releaseData)
    });
  }

  async getPayoutQuote(payoutData: any): Promise<any> {
    return this.request("/distributor/payout/quote", {
      method: "POST",
      body: JSON.stringify(payoutData)
    });
  }

  async createRelease(releaseData: any): Promise<any> {
    return this.request("/distributor/release", {
      method: "POST",
      body: JSON.stringify(releaseData)
    });
  }

  async getMigrationQuote(migrationData: any): Promise<any> {
    return this.request("/distributor/migration/quote", {
      method: "POST",
      body: JSON.stringify(migrationData)
    });
  }

  // ============ AUTH ENDPOINTS ============

  async login(credentials: any): Promise<any> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
  }

  async logout(): Promise<any> {
    return this.request("/auth/logout", {
      method: "POST"
    });
  }

  async verifyAuth(): Promise<any> {
    return this.request("/auth/verify");
  }

  async getProfile(): Promise<any> {
    return this.request("/auth/profile");
  }

  // ============ PAYMENTS ENDPOINTS ============

  async checkout(planData: any): Promise<any> {
    return this.request("/payments/checkout", {
      method: "POST",
      body: JSON.stringify(planData)
    });
  }

  async getPaymentPlans(): Promise<any[]> {
    return this.request("/payments/plans");
  }

  async updateSubscription(subData: any): Promise<any> {
    return this.request("/payments/subscription", {
      method: "POST",
      body: JSON.stringify(subData)
    });
  }

  // ============ HEALTH ============

  async health(): Promise<any> {
    return this.request("/health");
  }
}

// Export singleton instance
export const dmfApi = new DMFApiClient();

// Export for different environments
export function createDMFApiClient(env?: string): DMFApiClient {
  const environments: Record<string, string> = {
    local: "http://localhost:5000",
    staging: "https://dmf-api-staging.onrender.com",
    prod: "https://api.dmf-music-platform.com"
  };

  const baseUrl = environments[env || "local"] || "http://localhost:5000";
  return new DMFApiClient(baseUrl);
}
