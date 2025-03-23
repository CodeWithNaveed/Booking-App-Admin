import "./newHotel.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import { hotelInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

const NewHotel = () => {
  const [files, setFiles] = useState([]);
  const [info, setInfo] = useState({});
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const { data, loading: roomLoading } = useFetch(
    "https://booking-app-api-production-8253.up.railway.app/api/rooms"
  );

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelect = (e) => {
    const value = Array.from(e.target.selectedOptions, (option) => option.value);
    setRooms(value);
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!files.length) {
      alert("❌ Please select at least one image!");
      return;
    }

    setLoading(true);
    try {
      const list = await Promise.all(
        files.map(async (file) => {
          const data = new FormData();
          data.append("file", file);
          data.append("upload_preset", "upload");

          const uploadRes = await axios.post(
            "https://api.cloudinary.com/v1_1/djwgfsrvl/image/upload",
            data
          );

          return uploadRes.data.url;
        })
      );

      const newHotel = { ...info, rooms, photos: list };

      // 🛠 Token uthao (authentication ke liye)
      const token = localStorage.getItem("token");

      await axios.post(
        "https://booking-app-api-production-8253.up.railway.app/api/hotels",
        newHotel,
        {
          headers: { Authorization: `Bearer ${token}` }, // 👈 Token bhejna zaroori hai
        }
      );

      alert("✅ Hotel added successfully!");
      setInfo({});
      setFiles([]);
    } catch (err) {
      alert(err.response?.data?.message || "❌ Unauthorized! Only admins can add hotels.");
    } finally {
      setLoading(false);
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
            {files.length > 0 ? (
              <div className="imagePreview">
                {files.map((file, index) => (
                  <img key={index} src={URL.createObjectURL(file)} alt={`preview ${index}`} />
                ))}
              </div>
            ) : (
              <img
                src="https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                alt="No Image"
              />
            )}
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
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files))}
                  style={{ display: "none" }}
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
                    value={info[input.id] || ""}
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Featured</label>
                <select id="featured" onChange={(e) => setInfo({ ...info, featured: e.target.value === "true" })}>
                  <option value={false}>No</option>
                  <option value={true}>Yes</option>
                </select>
              </div>

              <div className="selectRooms">
                <label>Rooms</label>
                <select id="rooms" multiple onChange={handleSelect}>
                  {roomLoading
                    ? "loading..."
                    : data?.map((room) => (
                        <option key={room._id} value={room._id}>
                          {room.title}
                        </option>
                      ))}
                </select>
              </div>

              <button onClick={handleClick} disabled={loading}>
                {loading ? "Uploading..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewHotel;