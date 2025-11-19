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
 * Get artist earnings summary (lifetime, current period, pending)
 */
export async function getArtistSummary(artistId) {
  const res = await client.get("/api/royalties/summary", {
    params: { artistId },
  });
  return res.data;
}

/**
 * Get all statements for an artist
 */
export async function getArtistStatements(artistId) {
  const res = await client.get("/api/royalties/statements", {
    params: { artistId },
  });
  return res.data;
}

/**
 * Get detailed statement with line items
 */
export async function getStatement(statementId) {
  const res = await client.get(`/api/royalties/statements/${statementId}`);
  return res.data;
}

/**
 * Generate statements for a period (Admin only)
 */
export async function generateStatements(periodStart, periodEnd) {
  const res = await client.post("/api/royalties/admin/generate", {
    periodStart,
    periodEnd,
  });
  return res.data;
}

/**
 * Finalize a statement (Admin only)
 */
export async function finalizeStatement(statementId) {
  const res = await client.patch(
    `/api/royalties/admin/${statementId}/finalize`
  );
  return res.data;
}

/**
 * Create payout for a finalized statement (Admin only)
 */
export async function createPayout(statementId, scheduledFor, method = "manual") {
  const res = await client.post(`/api/royalties/admin/${statementId}/payout`, {
    scheduledFor,
    method,
  });
  return res.data;
}

/**
 * Get all payouts, optionally filtered by status (Admin only)
 */
export async function getPayouts(status = null) {
  const params = status ? { status } : {};
  const res = await client.get("/api/royalties/admin/payouts", { params });
  return res.data;
}

/**
 * Mark a payout as paid (Admin only)
 */
export async function markPayoutAsPaid(payoutId) {
  const res = await client.patch(
    `/api/royalties/admin/payouts/${payoutId}/mark-paid`
  );
  return res.data;
}

export default {
  getArtistSummary,
  getArtistStatements,
  getStatement,
  generateStatements,
  finalizeStatement,
  createPayout,
  getPayouts,
  markPayoutAsPaid,
};
