import "./newRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import { roomInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import axios from "axios";

const NewRoom = () => {
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState("");
  const [rooms, setRooms] = useState("");
  const [loading, setLoading] = useState(false);

  const { data, loading: hotelLoading } = useFetch(
    "https://booking-app-api-production-8253.up.railway.app/api/hotels"
  );

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!hotelId || !rooms.trim()) {
      alert("❌ Please fill all fields.");
      return;
    }

    const roomNumbers = rooms
      .split(",")
      .map((room) => {
        const trimmedRoom = room.trim();
        return /^\d+$/.test(trimmedRoom) ? { number: trimmedRoom } : null;
      })
      .filter(Boolean);

    if (roomNumbers.length === 0) {
      alert("❌ Please enter valid room numbers.");
      return;
    }

    setLoading(true);
    try {
      // 🛠 Token uthao (authentication ke liye)
      const token = localStorage.getItem("token");

      await axios.post(
        `https://booking-app-api-production-8253.up.railway.app/api/rooms/${hotelId}`,
        { ...info, roomNumbers },
        {
          headers: { Authorization: `Bearer ${token}` }, // 👈 Token bhejna zaroori hai
        }
      );

      alert("✅ Room added successfully!");
      setRooms(""); // Clear input after success
    } catch (err) {
      alert(err.response?.data?.message || "❌ Unauthorized! Only admins can add rooms.");
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
          <h1>Add New Room</h1>
        </div>
        <div className="bottom">
          <div className="right">
            <form>
              {roomInputs.map((input) => (
                <div className="formInput" key={input.id}>
                  <label>{input.label}</label>
                  <input
                    id={input.id}
                    type={input.type}
                    placeholder={input.placeholder}
                    onChange={handleChange}
                  />
                </div>
              ))}
              <div className="formInput">
                <label>Rooms</label>
                <textarea
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="Enter room numbers separated by commas (e.g., 101, 102, 103)."
                />
              </div>
              <div className="formInput">
                <label>Choose a hotel</label>
                <select value={hotelId} onChange={(e) => setHotelId(e.target.value)}>
                  <option value="">Select a hotel</option>
                  {hotelLoading ? (
                    <option>Loading...</option>
                  ) : (
                    data?.map((hotel) => (
                      <option key={hotel._id} value={hotel._id}>
                        {hotel.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <button onClick={handleClick} disabled={loading}>
                {loading ? "Submitting..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;