/**
 * DMF-MUSIC-PLATFORM Main Router Configuration
 * 
 * Routes:
 * /                    ? ControlCenterPage (home dashboard - OWNER/ADMIN)
 * /roster              ? RosterPage (grid of artists + divisions)
 * /artists/:slug       ? ArtistProfilePage (artist detail)
 * /divisions/:slug     ? DivisionDetailPage (division detail)
 * /portal              ? PortalLayout (customer/artist portal)
 * /portal/*            ? Portal sub-pages (home, analytics, distribution)
 * *                    ? Navigate to home
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Internal OS Pages
import ControlCenterPage from "./pages/ControlCenterPage";
import RosterPage from "./pages/RosterPage";
import ArtistProfilePage from "./pages/ArtistProfilePage";
import DivisionDetailPage from "./pages/DivisionDetailPage";

// Portal Pages (Customer/Artist View)
import PortalLayout from "./pages/PortalLayout";
import PortalHomePage from "./pages/PortalHomePage";
import PortalAnalyticsPage from "./pages/PortalAnalyticsPage";
import PortalDistributionPage from "./pages/PortalDistributionPage";

// Royalty Pages (v1.2 - Artist Earnings & Payouts)
import ArtistEarningsDashboard from "./pages/ArtistEarningsDashboard";
import StatementDetail from "./pages/StatementDetail";
import AdminRoyaltyBoard from "./pages/AdminRoyaltyBoard";

// StreamGod Dashboard Pages (v2.0 - Real-time Analytics)
import OwnerDashboard from "./pages/OwnerDashboard";
import ArtistDashboard from "./pages/ArtistDashboard";
// Pricing System Pages
import PricingPlansPage from "./pages/PricingPlansPage";
import AdminPricingPlans from "./pages/AdminPricingPlans";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ================================================================ */}
        {/* INTERNAL OS (Control Center - OWNER/ADMIN Only)                 */}
        {/* ================================================================ */}
        
        {/* Home Dashboard */}
        <Route path="/" element={<ControlCenterPage />} />

        {/* Roster Management */}
        <Route path="/roster" element={<RosterPage />} />

        {/* Artist Detail */}
        <Route path="/artists/:slug" element={<ArtistProfilePage />} />

        {/* Division Detail */}
        <Route path="/divisions/:slug" element={<DivisionDetailPage />} />

        {/* ================================================================ */}
        {/* ROYALTY SYSTEM v1.2 (Artist Earnings & Payouts)                */}
        {/* ================================================================ */}
        
        {/* Artist Earnings Dashboard */}
        <Route path="/earnings" element={<ArtistEarningsDashboard />} />
        
        {/* Statement Detail */}
        <Route path="/earnings/:statementId" element={<StatementDetail />} />
        
        {/* Admin Royalty Board */}
        <Route path="/admin/royalties" element={<AdminRoyaltyBoard />} />

        {/* ================================================================ */}
        {/* STREAMGOD DASHBOARDS v2.0 (Real-time Analytics)                */}
        {/* ================================================================ */}
        
        {/* Owner Command Center */}
        <Route path="/dashboard/owner" element={<OwnerDashboard />} />
        
        {/* Artist Performance Dashboard */}
        <Route path="/dashboard/artist/:artistId" element={<ArtistDashboard />} />

        {/* ================================================================ */}
        {/* PRICING SYSTEM (MongoDB-backed Plans)                           */}
        {/* ================================================================ */}
        <Route path="/pricing" element={<PricingPlansPage />} />
        <Route path="/admin/pricing" element={<AdminPricingPlans />} />

        {/* ================================================================ */}
        {/* CUSTOMER PORTAL (Public-Facing for Artists/Clients)             */}
        {/* ================================================================ */}
        
        <Route path="/portal" element={<PortalLayout />}>
          {/* Home Dashboard */}
          <Route index element={<PortalHomePage />} />
          
          {/* Analytics */}
          <Route path="analytics" element={<PortalAnalyticsPage />} />
          
          {/* Distribution */}
          <Route path="distribution" element={<PortalDistributionPage />} />
        </Route>

        {/* ================================================================ */}
        {/* CATCH-ALL                                                        */}
        {/* ================================================================ */}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
