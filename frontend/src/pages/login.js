import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Spinner } from "react-bootstrap";
import ErrorAlert from "../components/error-alert";
import SuccessAlert from "../components/success-alert";
const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const Login = () => {
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [spin, setSpin] = useState(true);
  const isRequestSent = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authCode = params.get("code");
    const state = params.get("state");

    if (authCode) {
      if (!isRequestSent.current) {
        isRequestSent.current = true;
        const fetchData = async () => {
          try {
            const response = await fetch(`${serverBaseUrl}/user/callback`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ code: authCode, state }),
            });

            const data = await response.json();
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete("code");
            currentUrl.searchParams.delete("state");
            window.history.replaceState(null, "", currentUrl.toString());

            if (response.status === 200) {
              localStorage.setItem("token", data.response.token);
              localStorage.setItem("user", JSON.stringify(data.response.data));
              setShowAlertSuccess(true);
              setShowAlertError(false);
              setAlertMessage(data.message);
              setTimeout(() => setShowAlertSuccess(false), 3000);
              navigate("/profile");
            } else {
              setShowAlertSuccess(false);
              setShowAlertError(true);
              setAlertMessage(data.message || "Invalid authentication code");
              setTimeout(() => {
                setShowAlertError(false);
                navigate("/");
              }, 3000);
            }
          } catch (error) {
            setShowAlertSuccess(false);
            setShowAlertError(true);
            setAlertMessage("Internal server error");
            setTimeout(() => {
              setShowAlertError(false);
              navigate("/");
            }, 3000);
          } finally {
            isRequestSent.current = false;
            setSpin(false);
          }
        };
        fetchData();
      }
    } else {
      navigate("/");
    }
  }, []);

  return (
    <Container className="mt-5">
      <div className="d-flex align-items-center flex-column w-100">
        {showAlertSuccess && (
          <SuccessAlert
            alertMessage={alertMessage}
            setShowAlertSuccess={setShowAlertSuccess}
          />
        )}

        {showAlertError && (
          <ErrorAlert
            alertMessage={alertMessage}
            setShowAlertError={setShowAlertError}
          />
        )}
      </div>
      {spin && (
        <div className="text-center">
          <Spinner
            className="custom-spinner"
            animation="border"
            role="status"
          />
          <p>Redirecting, please wait...</p>
        </div>
      )}
    </Container>
  );
};

export default Login;
