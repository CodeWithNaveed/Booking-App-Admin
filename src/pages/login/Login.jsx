import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api";
import { useSnackbar } from 'notistack';
import "./login.scss";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const { loading, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!credentials.username.trim() || !credentials.password.trim()) {
      enqueueSnackbar("Please fill all fields", { variant: 'error' });
      return;
    }

    dispatch({ type: "LOGIN_START" });

    try {
      const res = await api.post("/auth/login", credentials);

      if (!res.data.isAdmin) {
        throw new Error("You are not authorized as admin");
      }

      // Successful login
      dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
      enqueueSnackbar("Login successful!", { variant: 'success' });
      
      // Store token if available
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      
      let errorMessage = "Login failed";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      dispatch({
        type: "LOGIN_FAILURE",
        payload: { message: errorMessage },
      });

      enqueueSnackbar(errorMessage, { variant: 'error' });
    }
  };

  return (
    <div className="login">
      <div className="lContainer">
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          id="username"
          onChange={handleChange}
          value={credentials.username}
          className="lInput"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          onChange={handleChange}
          value={credentials.password}
          className="lInput"
          autoComplete="current-password"
        />
        <button 
          disabled={loading || !credentials.username || !credentials.password}
          onClick={handleClick} 
          className="lButton"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Logging in...
            </>
          ) : "Login"}
        </button>
      </div>
    </div>
  );
};

export default Login;