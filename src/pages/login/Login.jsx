import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./login.scss";

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const { loading, error, dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    dispatch({ type: "LOGIN_START" });

    try {
      const res = await axios.post(
        "https://booking-app-api-production-8253.up.railway.app/api/auth/login",
        credentials,
        { withCredentials: true }
      );

      console.log("Full API Response:", res);

      if (res.data.isAdmin) {
        dispatch({ type: "LOGIN_SUCCESS", payload: res.data.details || res.data });
        navigate("/");
      }
      else {
        console.log("User is not admin:", res.data);
        dispatch({
          type: "LOGIN_FAILURE",
          payload: { message: "You are not an admin user and cannot log in" },
        });
      }
    }
    catch (err) {
      console.log("Login Error:", err);
      dispatch({ type: "LOGIN_FAILURE", payload: err.response?.data || { message: "Unknown error" } });
    }
  };

  return (
    <div className="login">
      <div className="lContainer">
        <input
          type="text"
          placeholder="Username"
          id="username"
          onChange={handleChange}
          className="lInput"
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          onChange={handleChange}
          className="lInput"
        />
        <button disabled={loading} onClick={handleClick} className="lButton">
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <span className="error">{error.message}</span>}
      </div>
    </div>
  );
};

export default Login;