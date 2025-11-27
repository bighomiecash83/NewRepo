const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const DMF_API_KEY = import.meta.env.VITE_DMF_API_KEY as string | undefined;

async function dmfFetch(path: string, options: RequestInit = {}) {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
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

export const DmfApi = {
  getHealth: () => dmfFetch("/health"),
  getArtists: () => dmfFetch("/artists"),
  getReleases: () => dmfFetch("/releases"),
};
