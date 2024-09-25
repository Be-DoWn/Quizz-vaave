import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Logout from "../components/logout";

export default function Topics() {
  const [topicsData, setTopicsData] = useState([]);
  const [loading, setLoading] = useState(true); 
  const [useremail, setUserEmail] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:8080/session", { withCredentials: true })
      .then((res) => {
        if (res.data.loggedIn) {
          setUserEmail(res.data.user.email);
          getTopics(); // get topics after session validation
        } else {
          // if session is invalid go to login
          navigate("/home");
        }
      })
      .catch((err) => {
        console.log("Error checking session", err);
        navigate("/home");
      });
  }, [navigate]);

  const getTopics = () => {
    axios
      .get("http://localhost:8080/topics")
      .then((res) => {
        console.log(res.data);
        setTopicsData(res.data);
        setLoading(false); // set loading false once we got questions
      })
      .catch((err) => {
        console.log("Error fetching topics", err);
        setLoading(false); // set loading false if we got error and show no topics
      });
  };

  return (
    <div>
      {/* show useremail if session is valid else null */}
      {useremail ? <p>Welcome, {useremail}</p> : null}

      {loading ? (
        <p>Loading topics...</p>
      ) : topicsData.length > 0 ? (
        <div>
          {topicsData.map((dat) => (
            <p key={dat.id}>
              <Link to={`/questions/${dat.topic_name}/${dat.id}`}>
                {dat.topic_name}
              </Link>
            </p>
          ))}
        </div>
      ) : (
        <p>No topics available</p>
      )}
      <Logout />
    </div>
  );
}
