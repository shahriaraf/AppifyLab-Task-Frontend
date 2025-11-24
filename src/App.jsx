import { Routes, Route, Navigate } from "react-router-dom"; // Remove BrowserRouter import
import Login from "./pages/Login";
import Register from "./pages/Register";
import Feed from "./pages/Feed";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    // NO BrowserRouter here! It is already in main.jsx
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Feed Route */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;