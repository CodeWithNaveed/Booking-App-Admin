import "./newRoom.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import { useState } from "react";
import { roomInputs } from "../../formSource";
import useFetch from "../../hooks/useFetch";
import api from "../../api";
import { useSnackbar } from 'notistack';

const NewRoom = () => {
  const [info, setInfo] = useState({});
  const [hotelId, setHotelId] = useState("");
  const [rooms, setRooms] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  // Using api instance with relative path
  const { data, loading } = useFetch("/hotels");

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleClick = async (e) => {
    e.preventDefault();
    
    if (!hotelId) {
      enqueueSnackbar("Please select a hotel", { variant: 'error' });
      return;
    }

    if (!rooms.trim()) {
      enqueueSnackbar("Please enter room numbers", { variant: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      const roomNumbers = rooms.split(",")
        .map(room => room.trim())
        .filter(room => room !== "")
        .map(room => ({ number: room }));

      await api.post(`/rooms/${hotelId}`, { 
        ...info, 
        roomNumbers 
      });

      enqueueSnackbar("Room created successfully!", { variant: 'success' });
      // Reset form
      setInfo({});
      setRooms("");
      setHotelId("");
    } catch (err) {
      console.error("Error creating room:", err);
      const errorMessage = err.response?.data?.message || "Failed to create room";
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
                    value={info[input.id] || ''}
                  />
                </div>
              ))}

              <div className="formInput">
                <label>Rooms</label>
                <textarea
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  placeholder="Enter comma separated room numbers (e.g., 101, 102, 103)"
                />
              </div>

              <div className="formInput">
                <label>Choose a hotel</label>
                <select
                  id="hotelId"
                  onChange={(e) => setHotelId(e.target.value)}
                  value={hotelId}
                >
                  <option value="">Select a hotel</option>
                  {loading
                    ? <option>Loading hotels...</option>
                    : data?.map((hotel) => (
                        <option key={hotel._id} value={hotel._id}>
                          {hotel.name}
                        </option>
                      ))}
                </select>
              </div>

              <button 
                onClick={handleClick}
                disabled={isSubmitting || !hotelId || !rooms.trim()}
              >
                {isSubmitting ? "Creating..." : "Create Room"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewRoom;