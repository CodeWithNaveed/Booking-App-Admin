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

  const { data, loading: hotelLoading, error } = useFetch("https://booking-app-api-production-8253.up.railway.app/api/hotels");

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if (!hotelId || !rooms.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const roomNumbers = rooms.split(",").map((room) => {
      const trimmedRoom = room.trim();
      if (!trimmedRoom.match(/^\d+$/)) {
        alert("Room numbers must be valid numbers separated by commas.");
        return null;
      }
      return { number: trimmedRoom };
    }).filter(Boolean);

    if (roomNumbers.length === 0) {
      alert("Please enter at least one valid room number.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `https://booking-app-api-production-8253.up.railway.app/api/rooms/${hotelId}`,
        { ...info, roomNumbers }
      );
      alert("Room added successfully!");
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
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
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="Enter room numbers separated by commas (e.g., 101, 102, 103)."
                />
              </div>
              <div className="formInput">
                <label>Choose a hotel</label>
                <select id="hotelId" onChange={(e) => setHotelId(e.target.value)}>
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
