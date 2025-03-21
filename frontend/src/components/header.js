import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import ErrorAlert from "./error-alert";
const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const Header = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const admin = JSON.parse(localStorage.getItem("admin"));
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPageWithCode =
    location.pathname === "/login" &&
    new URLSearchParams(location.search).has("code");

  const login = async (role) => {
    try {
      const response = await fetch(`${serverBaseUrl}/user/login?role=${role}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
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

  const logout = async () => {
    const accessToken = localStorage.getItem("token");

    if (!accessToken) {
      console.error("No access token found");
      return;
    }

    try {
      const response = await fetch(`${serverBaseUrl}/user/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseData = await response.json();
      if (response.ok) {
        localStorage.clear();
        navigate("/");
      } else if (responseData?.error === "jwt expired") {
        setAlertMessage("Your session has expired. Please login again");
        setShowAlertError(true);
        setTimeout(() => {
          setShowAlertError(false);
          localStorage.clear();
          navigate("/");
        }, 3000);
      } else {
        setShowAlertError(true);
        setAlertMessage(responseData.message);
        setTimeout(() => setShowAlertError(false), 3000);
      }
    } catch (error) {
      setShowAlertError(true);
      setAlertMessage("Internal server error");
      setTimeout(() => setShowAlertError(false), 3000);
      console.error("An error occurred during logout", error);
    }
  };

  return (
    <>
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        className="position-sticky top-0 z-3"
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            Nbox
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          {!isLoginPageWithCode && (
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto w-100">
                {!user && !admin && (
                  <>
                    <Nav.Link as={Link} to="/">
                      Register
                    </Nav.Link>
                    <Nav.Link as={Link} to="/merchant/register">
                      Merchant Register
                    </Nav.Link>
                    <Nav.Link onClick={() => login("buyer")}>
                      User Login
                    </Nav.Link>
                    <Nav.Link onClick={() => login("merchant")}>
                      Merchant Login
                    </Nav.Link>
                  </>
                )}
                {admin && (
                  <Nav.Link as={Link} to={"admin/dashboard"}>
                    Dashboard
                  </Nav.Link>
                )}
                {(user || admin) && (
                  <div className="w-100 d-flex align-items-center justify-content-between">
                    <div className="d-flex">
                      <Nav.Link as={Link} to={"/address"}>
                        Address
                      </Nav.Link>
                      <Nav.Link as={Link} to={"/profile"}>
                        Profile
                      </Nav.Link>
                      <Nav.Link as={Link} to={"/product"}>
                        Product
                      </Nav.Link>
                      <Nav.Link as={Link} to={"/product-listing"}>
                        Product Listing
                      </Nav.Link>
                      <Nav.Link as={Link} to={"/fetch-cart"}>
                        Fetch Cart
                      </Nav.Link>
                    </div>
                    <Nav.Link onClick={logout}>Logout</Nav.Link>
                  </div>
                )}
              </Nav>
            </Navbar.Collapse>
          )}
        </Container>
      </Navbar>
      <div className="d-flex align-items-center flex-column w-100">
        {showAlertError && (
          <ErrorAlert
            alertMessage={alertMessage}
            setShowAlertError={setShowAlertError}
          />
        )}
      </div>
    </>
  );
};

export default Header;
