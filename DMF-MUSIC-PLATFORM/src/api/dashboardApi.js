import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const client = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

// Add auth token to all requests
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("dmf_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get owner KPIs: streams, revenue, cuts, artist count, releases, QC issues
 */
export async function getOwnerKpis() {
  const res = await client.get("/api/dashboard/owner");
  return res.data;
}

/**
 * Get top releases by streams (last 30 days)
 */
export async function getTopReleases(limit = 5) {
  const res = await client.get("/api/dashboard/top-releases", {
    params: { limit },
  });
  return res.data;
}

/**
 * Get artist dashboard: streams, revenue, top releases, time series
 */
export async function getArtistDashboard(artistId) {
  const res = await client.get(`/api/dashboard/artist/${artistId}`);
  return res.data;
}

/**
 * Get all releases with metrics for table view
 */
export async function getReleaseTable() {
  const res = await client.get("/api/dashboard/releases-table");
  return res.data;
}

export default {
  getOwnerKpis,
  getTopReleases,
  getArtistDashboard,
  getReleaseTable,
};
