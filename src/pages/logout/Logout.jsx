// Logout.jsx
import { useState } from "react";
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CircularProgress from "@mui/material/CircularProgress";
import api from "../../api";  
import "./logout.scss";

const Logout = () => {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/signout', {}, { 
        withCredentials: true 
      });
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logout-item" onClick={handleLogout}>
      {loading ? (
        <CircularProgress size={20} />
      ) : (
        <>
          <ExitToAppIcon className="icon" />
          <span>Logout</span>
        </>
      )}
    </div>
  );
};

export default Logout;