import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Rooms from "./pages/room/rooms.jsx";
import Hotels from "./pages/hotels/hotels.jsx";
import Login from "./pages/login/login.jsx";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import "./index.css";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <BrowserRouter>
      <Routes>
        {!user && <Route path="/" element={<Navigate to="/login" />} />}
        {user && (
          <>
            <Route path="/" element={<Hotels />} />
            <Route path="/room" element={<Rooms />} />
            <Route path="/hotel/:id/rooms" element={<Rooms />} />
            <Route path="/rooms/:id" element={<Rooms />} />
          </>
        )}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
