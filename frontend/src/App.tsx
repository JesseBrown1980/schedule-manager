import { Routes, Route, Navigate } from "react-router-dom";
import SchedulePage from "./pages/schedule";

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/schedule" replace />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </div>
  );
}

export default App;
