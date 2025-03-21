import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { RxCross2 } from "react-icons/rx";
import { IoMdCheckmark } from "react-icons/io";
import { Container, Spinner } from "react-bootstrap";
const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const VerificationPage = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get("userID");
  const code = urlParams.get("code");
  const role = urlParams.get("role");
  const [spin, setSpin] = useState(false);
  const [successDiv, setSuccessDiv] = useState(false);
  const [alertDiv, setAlertDiv] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const isRequestSent = useRef(false);

  useEffect(() => {
    if (userId && code) {
      setSpin(true);
      if (!isRequestSent.current) {
        isRequestSent.current = true;
        const fetchData = async () => {
          try {
            const response = await fetch(
              `${serverBaseUrl}/user/verify-email`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId, code }),
              }
            );
            const responseData = await response.json();
            if (response.status === 200) {
              setSuccessDiv(true);
            } else if (response.status === 401) {
              setAlertDiv(true);
              setAlertMessage("Invalid verification link or expired");
            } else {
              setAlertDiv(true);
              setAlertMessage(responseData.message);
            }
          } catch (error) {
            setAlertDiv(true);
          } finally {
            isRequestSent.current = false;
            setSpin(false);
          }
        };
        fetchData();
      }
    } else {
      setAlertDiv(true);
      setAlertMessage("User Id or code is missing");
    }
  }, [userId]);

  const login = async () => {
    try {
      const response = await fetch(
        `${serverBaseUrl}/user/login?role=${role}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const responseData = await response.json();
      if (response.status === 200) {
        window.location.href = responseData.data;
      } else {
        console.error(responseData.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      {successDiv && (
        <div className="main-verify-div vh-100 vw-100 d-flex flex-column align-items-center py-5">
          <h1>Email Verified Successfully</h1>
          <div className="checkmark my-5">
            <IoMdCheckmark color="#fff" />
          </div>
          <p>
            Go to{" "}
            <Link
              onClick={(e) => login(e)}
              style={{
                color: "#146c43",
                textDecoration: "none",
              }}
            >
              login
            </Link>
          </p>
        </div>
      )}
      {alertDiv && (
        <div className="main-verify-div vh-100 vw-100 d-flex flex-column align-items-center py-5">
          <h1>{alertMessage}</h1>
          <div className="checkmark crossmark my-5">
            <RxCross2 color="#fff" />
          </div>
          <p>
            Go to{" "}
            <Link
              onClick={(e) => login(e)}
              style={{
                color: "#bb2d3b",
                textDecoration: "none",
              }}
            >
              login
            </Link>
          </p>
        </div>
      )}
      <Container className="mt-5">
        {spin && (
          <div className="text-center">
            <Spinner
              className="custom-spinner"
              animation="border"
              role="status"
            />
            <p>please wait...</p>
          </div>
        )}
      </Container>
    </>
  );
};

export default VerificationPage;
