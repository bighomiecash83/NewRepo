const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const DMF_API_KEY = process.env.NEXT_PUBLIC_DMF_API_KEY || "";

async function dmfFetch(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (DMF_API_KEY) {
    headers["x-dmf-api-key"] = DMF_API_KEY;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`DMF API error ${res.status}: ${text}`);
  }

  return res.json();
}

export const getHealth = () => dmfFetch("/health");
export const getArtists = () => dmfFetch("/artists");
export const getReleases = () => dmfFetch("/releases");
