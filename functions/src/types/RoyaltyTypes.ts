/**
 * RoyaltyTypes.ts
 * Type definitions for the DMF Royalty Lock-In system
 * Used by Firebase Firestore + Cloud Functions
 */

export type RoyaltyRole =
  | 'Songwriter'
  | 'Composer'
  | 'Producer'
  | 'FeaturedArtist'
  | 'LabelOwner'
  | 'Publisher';

export type EnrollmentOrg = 'BMI' | 'SoundExchange';

export type EnrollmentScope =
  | 'Writer'
  | 'Publisher'
  | 'FeaturedArtist'
  | 'RightsOwner';

export type EnrollmentStatusCode =
  | 'NotNeeded'
  | 'NotStarted'
  | 'Pending'
  | 'InProgress'
  | 'Completed'
  | 'Rejected';

export interface EnrollmentStatus {
  org: EnrollmentOrg;
  scope: EnrollmentScope;
  status: EnrollmentStatusCode;
  externalId?: string; // e.g., BMI #, SoundExchange member ID
  lastUpdatedAt: string; // ISO 8601 string
  lastUpdatedBy?: string; // DMF staff userId
  notes?: string;
}

export interface TaxInfo {
  taxIdType?: 'SSN' | 'EIN' | 'ITIN' | 'Other';
  taxIdLast4?: string; // Only store last 4 digits; full ID in vault
  countryOfTaxResidence?: string;
  wFormType?: 'W-9' | 'W-8BEN' | 'Other';
}

export interface PayoutInfo {
  method?: 'DirectDeposit' | 'PayPal' | 'Check' | 'Other';
  currency?: string; // 'USD', etc.
  bankName?: string;
  accountLast4?: string; // Only last 4; full account in vault
  routingLast4?: string; // Only last 4
  paypalEmail?: string;
}

export interface ProMemberships {
  bmi?: {
    hasAccount: boolean;
    accountNumber?: string;
    writerNameOnFile?: string;
    publisherAccountNumber?: string;
    lastVerifiedAt?: string; // ISO 8601
  };
  otherPro?: {
    orgName?: string; // ASCAP, SESAC, etc.
    accountNumber?: string;
    lastVerifiedAt?: string;
  };
}

export interface SoundExchangeInfo {
  hasAccount: boolean;
  artistMemberId?: string; // SoundExchange featured artist ID
  rightsOwnerAccountId?: string; // SoundExchange rights owner/label ID
  lastVerifiedAt?: string; // ISO 8601
}

export interface ConsentInfo {
  royaltyLockInEnabled: boolean; // Master toggle for royalty protection
  allowAdminEnrollment: boolean; // Allow DMF staff to help with enrollment
  consentTimestamp: string; // ISO 8601, when they agreed
  consentMethod: 'InApp' | 'Esign' | 'Email' | 'Other';
}

/**
 * RoyaltyProfile document
 * Stored in Firestore at: royaltyProfiles/{artistId}
 */
export interface RoyaltyProfile {
  // Primary identifiers
  artistId: string; // Document ID + field for clarity
  userId?: string; // Link to app user account

  // Legal identity
  legalFirstName: string;
  legalLastName: string;
  stageNames: string[]; // ["Big Homie Cash", "DeAngelo", ...]
  dateOfBirth: string; // ISO 8601 date

  // Contact & address
  country: string; // 'US', 'UK', etc.
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrRegion?: string; // 'OH', 'CA', etc. (optional for non-US)
  postalCode: string;
  phoneNumber: string;
  email: string;

  // Role flags
  roles: RoyaltyRole[]; // ['Songwriter', 'FeaturedArtist', ...]
  isSongwriter: boolean;
  isFeaturedArtist: boolean;
  isLabelOwner: boolean;
  isPublisher: boolean;

  // Sensitive data (consider vault/tokenization for production)
  taxInfo?: TaxInfo;
  payoutInfo?: PayoutInfo;

  // PRO memberships
  proMemberships?: ProMemberships;

  // SoundExchange enrollment
  soundExchange?: SoundExchangeInfo;

  // Royalty Lock-In consent & feature flag
  consent: ConsentInfo;

  // Enrollment statuses (the "checklist" of what's completed)
  enrollmentStatuses: EnrollmentStatus[];

  // Audit timestamps
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Release document (simplified for gate check)
 * Stored in Firestore at: releases/{releaseId}
 */
export interface ReleaseContributor {
  artistId: string;
  roles: RoyaltyRole[]; // e.g., ['Songwriter', 'FeaturedArtist']
}

export interface Release {
  releaseId: string;
  title: string;
  contributors: ReleaseContributor[]; // Artists involved
  status: 'Draft' | 'Scheduled' | 'Published' | 'Rejected';
  releaseDate: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

/**
 * Response types for Cloud Functions
 */
export interface CanPublishResponse {
  canPublish: boolean;
  blockingIssues: {
    artistId: string;
    reason: string; // e.g., "Missing BMI Writer enrollment"
  }[];
}

export interface RoyaltyProfileResponse {
  success: boolean;
  data?: RoyaltyProfile;
  error?: string;
}
