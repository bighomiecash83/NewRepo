/**
 * Frontend API Client for Royalty Lock-In
 * Used by Google AI Studio, Lovable, or any web frontend
 *
 * Usage:
 * const royaltyClient = new RoyaltyApiClient('https://us-central1-YOUR_PROJECT.cloudfunctions.net');
 * const profile = await royaltyClient.getRoyaltyProfile('ARTIST_123');
 */

import {
  RoyaltyProfile,
  RoyaltyProfileResponse,
  CanPublishResponse,
} from './functions/src/types/RoyaltyTypes';

export class RoyaltyApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Fetch a royalty profile for an artist
   */
  async getRoyaltyProfile(artistId: string): Promise<RoyaltyProfile> {
    const res = await fetch(`${this.baseUrl}/getRoyaltyProfile?artistId=${artistId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch royalty profile: ${res.statusText}`);
    }
    const data = (await res.json()) as RoyaltyProfileResponse;
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Unknown error');
    }
    return data.data;
  }

  /**
   * Create or update a royalty profile
   */
  async saveRoyaltyProfile(profile: Partial<RoyaltyProfile>): Promise<RoyaltyProfile> {
    const res = await fetch(`${this.baseUrl}/saveRoyaltyProfile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    });
    if (!res.ok) {
      throw new Error(`Failed to save royalty profile: ${res.statusText}`);
    }
    const data = (await res.json()) as RoyaltyProfileResponse;
    if (!data.success || !data.data) {
      throw new Error(data.error || 'Unknown error');
    }
    return data.data;
  }

  /**
   * Delete a royalty profile (DMF staff only)
   */
  async deleteRoyaltyProfile(artistId: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/deleteRoyaltyProfile?artistId=${artistId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      throw new Error(`Failed to delete royalty profile: ${res.statusText}`);
    }
  }

  /**
   * Check if a release can be published to DSPs
   * Returns { canPublish: boolean, blockingIssues: [...] }
   */
  async canPublishRelease(releaseId: string): Promise<CanPublishResponse> {
    const res = await fetch(`${this.baseUrl}/canPublishRelease?releaseId=${releaseId}`);
    if (!res.ok) {
      throw new Error(`Failed to check release status: ${res.statusText}`);
    }
    return (await res.json()) as CanPublishResponse;
  }

  /**
   * Get release status including full details
   */
  async getReleaseStatus(releaseId: string): Promise<any> {
    const res = await fetch(`${this.baseUrl}/getReleaseStatus?releaseId=${releaseId}`);
    if (!res.ok) {
      throw new Error(`Failed to get release status: ${res.statusText}`);
    }
    return await res.json();
  }
}

/**
 * Example React Hook for using the Royalty API in a component
 *
 * Usage:
 * const { profile, loading, error } = useRoyaltyProfile('ARTIST_123');
 */
export function useRoyaltyApiClient(baseUrl: string): RoyaltyApiClient {
  return new RoyaltyApiClient(baseUrl);
}
