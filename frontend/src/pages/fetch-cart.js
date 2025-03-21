import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import SuccessAlert from "../components/success-alert";
import ErrorAlert from "../components/error-alert";

const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const FetchCart = () => {
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [carts, setCarts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getCarts();
  }, []);

  const getCarts = async () => {
    try {
      const response = await fetch(`${serverBaseUrl}/buyer/cart/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        setCarts(responseData.response?.data || []);
      } else if (response.status === 404) {
        setCarts([]);
      } else {
        console.error("Failed to fetch carts");
      }
    } catch (error) {
      console.error("Error fetching carts:", error);
    }
  };

  const handleValidate = async (merchantId) => {
    try {
      const response = await fetch(
        `${serverBaseUrl}/buyer/cart/validate/${merchantId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const responseData = await response.json();
      if (response.status === 200) {
        setShowAlertError(false);
        navigate(`/order/${merchantId}`);
      } else if (responseData?.data?.error === "jwt expired") {
        setAlertMessage("Your session has expired. Please login again");
        setShowAlertSuccess(false);
        setShowAlertError(true);
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin");
        setTimeout(() => {
          setShowAlertError(false);
          navigate("/");
        }, 5000);
      } else {
        setShowAlertSuccess(false);
        setShowAlertError(true);
        setAlertMessage(responseData.message);
        setTimeout(() => setShowAlertError(false), 3000);
      }
    } catch (error) {
      setShowAlertSuccess(false);
      setShowAlertError(true);
      setAlertMessage("Internal server error");
      setTimeout(() => setShowAlertError(false), 3000);
      console.error("Error updating users:", error);
    } finally {
      getCarts();
    }
  };

  return (
    <Container className="pb-5">
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
      <div className="my-5">
        {carts?.carts?.length > 0 && (
          <>
            <h1 className="text-center mb-4">Cart Listing outside store</h1>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Store Image</th>
                  <th>Store Name</th>
                  <th>Total Item</th>
                  <th>Total Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {carts?.carts?.map((cart, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={cart?.storeImage}
                        alt="store-image"
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                      />
                    </td>
                    <td>{cart?.storeName}</td>
                    <td>{cart?.totalCartItems}</td>
                    <td>{cart?.totalPrice}</td>
                    <td>
                      <div class="form-check form-switch d-flex align-items-center justify-content-between">
                        <Button
                          variant="primary"
                          onClick={() => handleValidate(cart.merchantId)}
                        >
                          Checkout
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        {carts?.cartItems?.length > 0 && (
          <>
            <h1 className="text-center mb-4">Cart Listing inside store</h1>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Image</th>
                  <th>Product Name</th>
                  <th>Product quantity</th>
                  <th>Product Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {carts?.cartItems?.map((cart, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={cart?.images[0]}
                        alt="product-image"
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                      />
                    </td>
                    <td>{cart?.enName}</td>
                    <td>{cart?.quantity}</td>
                    <td>{cart?.price}</td>
                    <td>
                      <div class="form-check form-switch d-flex align-items-center justify-content-between">
                        <Button
                          variant="primary"
                          onClick={() => handleValidate(cart.merchantId)}
                        >
                          Checkout
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </Container>
  );
};

export default FetchCart;
