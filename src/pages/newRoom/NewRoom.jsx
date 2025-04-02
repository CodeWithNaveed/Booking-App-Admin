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

  const { data, loading } = useFetch("/hotels");

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setInfo((prev) => ({ ...prev, [e.target.id]: value }));
  };

  const validateRoomNumbers = (roomString) => {
    const roomNumbers = roomString.split(",")
      .map(room => room.trim())
      .filter(room => room !== "");

    for (const room of roomNumbers) {
      if (isNaN(Number(room))) {
        throw new Error(`"${room}" is not a valid room number. Please enter numbers only.`);
      }
    }

    return roomNumbers.map(room => ({ number: Number(room) }));
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
      const roomNumbers = await validateRoomNumbers(rooms);

      const payload = { 
        ...info,
        roomNumbers 
      };

      console.log("Sending payload:", payload);

      await api.post(`/rooms/${hotelId}`, payload);
      enqueueSnackbar("Room created successfully!", { variant: 'success' });
      
      // Reset form
      setInfo({});
      setRooms("");
      setHotelId("");
    } catch (err) {
      console.error("Error creating room:", err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         "Failed to create room";
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
                    type={input.type === 'number' ? 'number' : 'text'}
                    placeholder={input.placeholder}
                    onChange={handleChange}
                    value={info[input.id] || ''}
                    min={input.type === 'number' ? '1' : undefined}
                  />
                </div>
              ))}

              <div className="formInput" style={{width: '300px'}}>
                <label>Rooms</label>
                <textarea
                  value={rooms}
                  onChange={(e) => {
                    // Basic validation - allow only numbers, commas and spaces
                    const value = e.target.value.replace(/[^0-9,\s]/g, '');
                    setRooms(value);
                  }}
                  placeholder="Enter comma separated room numbers (e.g., 101, 102, 103)"
                  style={{width: '100%' }}
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