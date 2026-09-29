import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { Diagnose } from "./pages/Diagnose";
import { DiagnosisResult } from "./pages/DiagnosisResult";
import { ServiceCenters } from "./pages/ServiceCenters";
import { RecyclingCenters } from "./pages/RecyclingCenters";
import { CircularMarketplace } from "./pages/CircularMarketplace";
import { DevicePassportPage } from "./pages/DevicePassportPage";
import { Rewards } from "./pages/Rewards";
import { Dashboard } from "./pages/Dashboard";
import { AdminAnalyticsPage } from "./pages/AdminAnalytics";
import { api } from "./services/api";

export function App() {
  const [userPoints, setUserPoints] = useState<number>(350);

  useEffect(() => {
    api
      .getDashboard()
      .then((res) => {
        if (res && res.reward_points !== undefined) {
          setUserPoints(res.reward_points);
        }
      })
      .catch(() => {
        // Fallback demo state
      });
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#080b0a] text-[#f4f6f4] flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
        <Navbar userPoints={userPoints} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/diagnose" element={<Diagnose />} />
            <Route path="/diagnosis-result" element={<DiagnosisResult />} />
            <Route path="/service-centers" element={<ServiceCenters />} />
            <Route path="/recycling-centers" element={<RecyclingCenters />} />
            <Route path="/marketplace" element={<CircularMarketplace />} />
            <Route path="/passport" element={<DevicePassportPage />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminAnalyticsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
