export interface RegisteredAddress {
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface LegalInfo {
  entityName: string;
  entityNumber: string;
  entityType: string;
  state: string;
  status: string;
  filingDate: string;
  certifiedDate: string;
  county: string;
  city: string;
  statutoryAgent: string;
  sharesAuthorized: string;
  capital: number;
  secretariesOfState: string[];
  validationNumber: string;
  registeredAddresses: RegisteredAddress[];
}

export interface BrandingInfo {
  officialName: string;
  shortName: string;
  tagline: string;
  brandColors: string[];
  certificateImagePath: string;
}

export interface CompanyProfile {
  legal: LegalInfo;
  branding: BrandingInfo;
}

export interface ServiceItem {
  code: string;
  name: string;
  summary: string;
}

export interface ServiceDivision {
  id: string;
  name: string;
  category: string;
  description: string;
  services: ServiceItem[];
}

const BASE_URL = "/api/company";

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  const res = await fetch(`${BASE_URL}/profile`);
  if (!res.ok) throw new Error("Failed to load company profile");
  return res.json();
}

export async function fetchServiceDivisions(): Promise<ServiceDivision[]> {
  const res = await fetch(`${BASE_URL}/services`);
  if (!res.ok) throw new Error("Failed to load service divisions");
  return res.json();
}

export async function checkCompanyHealth(): Promise<{ status: string; company: string; serviceCount: number }> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) throw new Error("Company service health check failed");
  return res.json();
}
