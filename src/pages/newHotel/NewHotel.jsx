import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { hotelInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import { useSnackbar } from 'notistack';
import api from "../../api";
import axios from "axios";

const NewHotel = () => {
  const [files, setFiles] = useState(null);
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Using api instance for fetching rooms
  const { data, loading } = useFetch("/rooms");

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setRooms(value);
  };

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (!files || files.length === 0) {
      enqueueSnackbar("Please select at least one image", { variant: 'error' });
      return;
    }
  
    setIsSubmitting(true);
  
    try {
      // 1. Upload images using a completely independent method
      const imageUrls = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("upload_preset", "upload");
  
          // Using fetch API instead of axios to avoid any global axios configs
          const response = await fetch(
            "https://api.cloudinary.com/v1_1/djwgfsrvl/image/upload",
            {
              method: "POST",
              body: formData,
              // No headers needed for unsigned uploads
            }
          );
  
          if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
          }
  
          const data = await response.json();
          return data.secure_url;
        })
      );
  
      // 2. Create hotel using your authenticated api instance
      const newHotel = {
        ...info,
        rooms,
        photos: imageUrls,
      };
  
      await api.post("/hotels", newHotel);
      enqueueSnackbar("Hotel created successfully!", { variant: 'success' });
  
      // Reset form
      setFiles(null);
      setInfo({});
      setRooms([]);
  
    } catch (err) {
      console.error("Error:", err);
      
      let errorMessage = "Failed to create hotel";
      if (err.message.includes("Upload failed")) {
        errorMessage = "Image upload failed. Please try again.";
      } else if (err.response?.status === 401) {
        errorMessage = "Unauthorized - Please login again";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
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
          <h1>Add New Hotel</h1>
        </div>
        <div className="bottom">
          <div className="left">
            <img
              src={
                files && files[0]
                  ? URL.createObjectURL(files[0])
                  : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
              }
              alt="Hotel preview"
            />
          </div>
          <div className="right">
            <form>
              <div className="formInput">
                <label htmlFor="file">
                  Images: <DriveFolderUploadOutlinedIcon className="icon" />
                </label>
                <input
                  type="file"
                  id="file"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  style={{ display: "none" }}
                  accept="image/*"
                />
              </div>

              {hotelInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    onChange={handleChange}
                    type={input.type}
                    placeholder={input.placeholder}
                    value={info[input.id] || ''}
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Featured</label>
                <select 
                  id="featured" 
                  onChange={handleChange}
                  value={info.featured || false}
                >
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>

              <div className="selectRooms">
                <label>Rooms</label>
                <select 
                  id="rooms" 
                  multiple 
                  onChange={handleSelect}
                  value={rooms}
                >
                  {loading
                    ? "Loading rooms..."
                    : data?.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.title}
                        </option>
                      ))}
                </select>
              </div>

              <button 
                onClick={handleClick}
                disabled={isSubmitting}
                className={isSubmitting ? "loading" : ""}
              >
                {isSubmitting ? "Creating..." : "Create Hotel"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;