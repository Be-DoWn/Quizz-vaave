import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [useremail, setemail] = useState("");
  const navigate = useNavigate();
  axios.defaults.withCredentials = true;
  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      console.log(response);

      try {
        const res = await axios.post(
          "http://localhost:8080/login",
          { accessToken: response.access_token }
          // { withCredentials: true } //noo need to pass the cookies beacuse of axios.defaults
        );

        console.log(res.data.email);
        setemail(res.data.email);

        // Navigate to topics page
        navigate("/topics");
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <>
      <div className="Login">
        {useremail ? (
          <p>{useremail}</p>
        ) : (
          <p>Please click the button to login</p>
        )}
        <button onClick={() => googleLogin()}>Login</button>
      </div>
    </>
  );
}
