import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import api from "../../api";
import { useSnackbar } from 'notistack';
import axios from "axios";

const New = ({ inputs, title }) => {
  const [file, setFile] = useState(null);
  const [info, setInfo] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Using your api instance for fetching users
  const { data, loading, error } = useFetch("/users");

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (!file) {
      enqueueSnackbar("Please select an image", { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Upload image to Cloudinary (using axios directly)
      const imageData = new FormData();
      imageData.append("file", file);
      imageData.append("upload_preset", "upload");
      
      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/djwgfsrvl/image/upload",
        imageData
      );

      // Step 2: Create user with your API (using api instance)
      const newUser = {
        ...info,
        img: uploadRes.data.secure_url, // Using secure_url from Cloudinary
      };

      await api.post("/auth/register", newUser);

      enqueueSnackbar("User created successfully!", { variant: 'success' });
      // Reset form
      setFile(null);
      setInfo({});
    } catch (err) {
      console.error("Error:", err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Failed to create user";
      enqueueSnackbar(errorMessage, { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="new">
      <Sidebar />
      <div className="newContainer">
        <Navbar />
        <div className="top">
          <h1>{title}</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                file
                  ? URL.createObjectURL(file)
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="Preview"
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Image: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: "none" }}
                />
              </div>

              {inputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    id={input.id}
                    value={info[input.id] || ''}
                  />
                </div>
              ))}
              
              <button 
                onClick={handleClick} 
                disabled={isSubmitting}
                className={isSubmitting ? "loading" : ""}
              >
                {isSubmitting ? "Creating..." : "Create User"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;