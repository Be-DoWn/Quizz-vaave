import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Logout() {
  const navigate = useNavigate();
  const logoutfn = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8080/logout",
        { withCredentials: true } //cookies are sent with the request
      );
      navigate("/home");
      console.log("Logged out successfully");
    } catch (err) {
      console.log("Error during logout:", err);
    }
  };

  return (
    <button
      onClick={() => {
        logoutfn();
      }}
    >
      Logout
    </button>
  );
}
