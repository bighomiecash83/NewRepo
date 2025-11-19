using System.Collections.Generic;

namespace DmfMusicPlatform.Domain
{
    public class RegisteredAddress
    {
        public string Label { get; set; } = "";
        public string Street { get; set; } = "";
        public string City { get; set; } = "";
        public string State { get; set; } = "";
        public string PostalCode { get; set; } = "";
        public string Country { get; set; } = "";
    }

    public class LegalInfo
    {
        public string EntityName { get; set; } = "";
        public string EntityNumber { get; set; } = "";
        public string EntityType { get; set; } = "";
        public string State { get; set; } = "";
        public string Status { get; set; } = "";
        public string FilingDate { get; set; } = "";
        public string CertifiedDate { get; set; } = "";
        public string County { get; set; } = "";
        public string City { get; set; } = "";
        public string StatutoryAgent { get; set; } = "";
        public string SharesAuthorized { get; set; } = "";
        public decimal Capital { get; set; }
        public List<string> SecretariesOfState { get; set; } = new();
        public string ValidationNumber { get; set; } = "";
        public List<RegisteredAddress> RegisteredAddresses { get; set; } = new();
    }

    public class BrandingInfo
    {
        public string OfficialName { get; set; } = "";
        public string ShortName { get; set; } = "";
        public string Tagline { get; set; } = "";
        public List<string> BrandColors { get; set; } = new();
        public string CertificateImagePath { get; set; } = "";
    }

    public class CompanyProfile
    {
        public LegalInfo Legal { get; set; } = new();
        public BrandingInfo Branding { get; set; } = new();
    }

    public class ServiceItem
    {
        public string Code { get; set; } = "";
        public string Name { get; set; } = "";
        public string Summary { get; set; } = "";
    }

    public class ServiceDivision
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Category { get; set; } = "";
        public string Description { get; set; } = "";
        public List<ServiceItem> Services { get; set; } = new();
    }

    public class DmfCompanyConfig
    {
        public CompanyProfile CompanyProfile { get; set; } = new();
        public List<ServiceDivision> ServiceDivisions { get; set; } = new();
    }
}
