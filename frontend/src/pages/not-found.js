import React from "react";
import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  const gotToHome = () => {
    navigate("/");
  };
  return (
    <div className="">
      <h1>404 - Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button className="btn btn-primary" onClick={gotToHome}>Go to homepage</button>
    </div>
  );
}

export default NotFound;
