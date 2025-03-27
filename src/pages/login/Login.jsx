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

  // const handleClick = async (e) => {
  //   e.preventDefault();
  //   localStorage.clear();

  //   // Basic validation for manual login
  //   if (!credentials.username.trim() || !credentials.password.trim()) {
  //     enqueueSnackbar("Please fill all fields", { variant: 'error' });
  //     return;
  //   }

  //   dispatch({ type: "LOGIN_START" });

  //   try {
  //     const res = await api.post("/auth/login", credentials);
  //     console.log("Login response:", res.data);

  //     if (!res.data.isAdmin) {
  //       throw new Error("You are not authorized as admin");
  //     }

  //     // Successful login
  //     // dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
  //     // enqueueSnackbar("Login successful!", { variant: 'success' });

  //     // If access_token exists in cookies, store it in localStorage
  //     const accessToken = getCookie('access_token');
  //     if (accessToken) {
  //       console.log("Access token found in cookies:", accessToken);
  //       localStorage.setItem('token', accessToken);
  //       console.log("Token stored in localStorage", localStorage.getItem('token'));

  //       // Dispatch login success (you might want to fetch user data here)
  //       dispatch({ type: "LOGIN_SUCCESS", payload: { token: accessToken } });
  //       enqueueSnackbar("Logged in via existing session", { variant: 'success' });
  //       navigate("/");
  //       return;
  //     }

  //     // navigate("/");
  //   } 
  //   catch (err) {
  //     console.error("Login error:", err);

  //     let errorMessage = "Login failed";
  //     if (err.response?.data?.message) {
  //       errorMessage = err.response.data.message;
  //     } else if (err.message) {
  //       errorMessage = err.message;
  //     }

  //     dispatch({
  //       type: "LOGIN_FAILURE",
  //       payload: { message: errorMessage },
  //     });

  //     enqueueSnackbar(errorMessage, { variant: 'error' });
  //   }
  // };

  const handleClick = async (e) => {
    e.preventDefault();

    // Clear previous session data
    localStorage.removeItem('token'); // Only remove token, not everything

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
      const accessToken = res.data.accessToken
        || res.data.token
        || getCookie('access_token')
        || res.data.details._id;

      if (!accessToken) {
        throw new Error("No authentication token received");
      }

      // 4. Store token securely
      localStorage.setItem('token', accessToken);
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