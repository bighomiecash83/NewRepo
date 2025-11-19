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
