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

  // Function to get cookie by name
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    localStorage.clear();

    // Validate inputs
    if (!credentials.username.trim() || !credentials.password.trim()) {
      enqueueSnackbar("Please fill all fields", { variant: 'error' });
      return;
    }

    dispatch({ type: "LOGIN_START" });

    try {
      // 1. Make login request
      const res = await api.post("/auth/login", credentials);
      console.log("Login response:", res.data);

      // 2. Check admin status
      if (!res.data.isAdmin) {
        throw new Error("You are not authorized as admin");
      }

      // 3. Get token from multiple possible sources
      const token = getCookie('access_token')
        || res.data.details._id;

      if (!accessToken) {
        throw new Error("No authentication token received");
      }

      // 4. Store token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({
        ...res.data.user,
        isAdmin: res.data.isAdmin
      }));
      console.log("Token stored successfully");

      // 5. Dispatch success with complete user data
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          token: accessToken,
          user: res.data.user || { username: credentials.username }
        }
      });

      // 6. Show success and redirect
      enqueueSnackbar("Login successful!", { variant: 'success' });
      navigate("/");

    } catch (err) {
      console.error("Login error:", err);

      // Enhanced error handling
      const errorMessage = err.response?.data?.message
        || err.message
        || "Login failed";

      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage, // Simplified payload
      });

      enqueueSnackbar(errorMessage, { variant: 'error' });

      // Clear sensitive data on error
      setCredentials({ username: '', password: '' });
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