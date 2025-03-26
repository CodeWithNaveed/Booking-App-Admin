import "./new.scss";
import Sidebar from "../../components/sidebar/Sidebar";
import Navbar from "../../components/navbar/Navbar";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import axios from "axios";
import { useSnackbar } from 'notistack';


const New = ({ inputs, title }) => {
  console.log("New component rendering"); // Add this line
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [file, setFile] = useState("");
  const [info, setInfo] = useState({});

  const { data, loading, error } = useFetch("https://booking-app-api-production-8253.up.railway.app/api/users");

  console.log("Hook data:", { data, loading, error }); // Add this line

  const handleChange = (e) => {
    setInfo((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const { enqueueSnackbar } = useSnackbar();

  const handleClick = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "upload");

      const uploadRes = await axios.post(
        "https://api.cloudinary.com/v1_1/djwgfsrvl/image/upload",
        data
      );

      const { url } = uploadRes.data;

      const newUser = {
        ...info,
        img: url,
      };

      const response = await axios.post(
        "https://booking-app-api-production-8253.up.railway.app/api/auth/register",
        newUser,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      console.log("User created successfully:", response.data);
      enqueueSnackbar('User created successfully!', { variant: 'success' });
    } catch (err) {
      console.error("Error creating user:", err.response?.data || err.message);
      enqueueSnackbar('Error creating user', { variant: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };


  console.log(info);
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
              alt=""
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
                  />
                </div>
              ))}
              <button onClick={handleClick}>Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default New;