// import { useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../context/AuthContext";
// import api from "../../api";
// import { useSnackbar } from 'notistack';
// import "./login.scss";

// const Login = () => {
//   const [credentials, setCredentials] = useState({
//     username: "",
//     password: "",
//   });

//   const { loading, dispatch } = useContext(AuthContext);
//   const navigate = useNavigate();
//   const { enqueueSnackbar } = useSnackbar();

//   const handleChange = (e) => {
//     setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
//   };

//   const handleClick = async (e) => {
//     e.preventDefault();
    
//     // Basic validation
//     if (!credentials.username.trim() || !credentials.password.trim()) {
//       enqueueSnackbar("Please fill all fields", { variant: 'error' });
//       return;
//     }

//     dispatch({ type: "LOGIN_START" });

//     try {
//       const res = await api.post("/auth/login", credentials);

//       if (!res.data.isAdmin) {
//         throw new Error("You are not authorized as admin");
//       }

//       // Successful login
//       dispatch({ type: "LOGIN_SUCCESS", payload: res.data });
//       enqueueSnackbar("Login successful!", { variant: 'success' });
      
//       // Store token if available
//       if (res.data.token) {
//         localStorage.setItem('token', res.data.token);
//       }

//       navigate("/");
//     } catch (err) {
//       console.error("Login error:", err);
      
//       let errorMessage = "Login failed";
//       if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       dispatch({
//         type: "LOGIN_FAILURE",
//         payload: { message: errorMessage },
//       });

//       enqueueSnackbar(errorMessage, { variant: 'error' });
//     }
//   };

//   return (
//     <div className="login">
//       <div className="lContainer">
//         <h2>Admin Login</h2>
//         <input
//           type="text"
//           placeholder="Username"
//           id="username"
//           onChange={handleChange}
//           value={credentials.username}
//           className="lInput"
//           autoComplete="username"
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           id="password"
//           onChange={handleChange}
//           value={credentials.password}
//           className="lInput"
//           autoComplete="current-password"
//         />
//         <button 
//           disabled={loading || !credentials.username || !credentials.password}
//           onClick={handleClick} 
//           className="lButton"
//         >
//           {loading ? (
//             <>
//               <span className="spinner"></span>
//               Logging in...
//             </>
//           ) : "Login"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Login;







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
    
    // Check for access_token in cookies first
    const accessToken = getCookie('access_token');
    

    // Basic validation for manual login
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
      
      // If access_token exists in cookies, store it in localStorage
      if (accessToken) {
        console.log("Access token found in cookies:", accessToken);
        localStorage.setItem('token', accessToken);
        console.log("Token stored in localStorage", localStorage.getItem('token'));
        
        // Dispatch login success (you might want to fetch user data here)
        dispatch({ type: "LOGIN_SUCCESS", payload: { token: accessToken } });
        enqueueSnackbar("Logged in via existing session", { variant: 'success' });
        navigate("/");
        return;
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