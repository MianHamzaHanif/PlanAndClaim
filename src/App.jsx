import { Routes, Route } from "react-router-dom";
import "./App.css";
import PrivateRoutes from "./Utility/PrivateRoutes";
import Home from "./Components/HomePage/home";
import Dashboard from "./Components/Dashboard/Dashboard";
import Flexible from "./Components/Staking/Flexible";
import LongTerm from "./Components/Staking/LongTerm";
import LiquidityBonds from "./Components/Bonds/LiquidityBonds";
import Comeson from "./Components/Bonds/Comeson";
import Resonance from "./Components/DAO/Resonance";
import LevelPool from "./Components/DAO/LevelPool";
import Referral from "./Components/DAO/Referral";
import Service from "./Components/DAO/Service";
import ReciprocalPool from "./Components/DAO/ReciprocalPool";
import Incentive from "./Components/DAO/Incentive";
import Turbine from "./Components/Turbine/Turbine";
import Swap from "./Components/Swap/Swap";

import Invite from "./Components/Invite/Invite";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/invite" element={<Invite />} />
        <Route path="/invite/:ref" element={<Invite />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/flexible" element={<Flexible />} />
        <Route path="/longterm" element={<LongTerm />} />
        <Route path="/liquidity" element={<LiquidityBonds />} />
        <Route path="/comeson" element={<Comeson />} />
        <Route path="/resonance" element={<Resonance />} />
        <Route path="/Title" element={<LevelPool />} />
        <Route path="/referral" element={<Referral />} />
        <Route path="/service" element={<Service />} />
        <Route path="/reciprocal" element={<ReciprocalPool />} />
        <Route path="/incentive" element={<Incentive />} />
        <Route path="/turbine" element={<Turbine />} />
      	<Route path="/swap" element={<Swap />} />


        <Route path="/invite" element={<Invite />} />
      </Routes>
    </>
  );
}

export default App;
