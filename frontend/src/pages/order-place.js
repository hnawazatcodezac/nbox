import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Container } from "react-bootstrap";
import { loadStripe } from "@stripe/stripe-js";
import DatePicker from "react-datepicker";
import SuccessAlert from "../components/success-alert";
import ErrorAlert from "../components/error-alert";

const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;
const stripePublicKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;

const OrderPlace = () => {
  const { merchantId } = useParams();
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [cartDetails, setCartDetails] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    getCarts();
    fetchAddresses();
  }, []);

  const getCarts = async () => {
    try {
      const response = await fetch(
        `${serverBaseUrl}/buyer/cart/details/${merchantId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const responseData = await response.json();
      if (response.ok) {
        setCartDetails(responseData.response?.data || []);
      } else if (response.status === 404) {
        setCartDetails([]);
      } else {
        console.error("Failed to fetch carts");
      }
    } catch (error) {
      console.error("Error fetching carts:", error);
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${serverBaseUrl}/user/address`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        setAddresses(responseData.response?.data || []);
      } else {
        console.error("Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleCheckout = async (cartId) => {
    const stripe = await loadStripe(stripePublicKey);

    try {
      let requestBody = {
        addressId: selectedAddress,
      };

      if (selectedDate) {
        const localISOTime = new Date(
          selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, -1);

        requestBody.scheduleTime = localISOTime;
      }

      const response = await fetch(
        `${serverBaseUrl}/buyer/order/checkout/${cartId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const responseData = await response.json();
      if (response.status === 201) {
        const sessionId = responseData?.response?.data?.sessionId;
        await stripe.redirectToCheckout({
          sessionId,
        });
      } else if (response.status === 400) {
        setAlertMessage(responseData.message || "An error occurred");
        setShowAlertSuccess(false);
        setShowAlertError(true);
        setTimeout(() => setShowAlertError(null), 3000);
      } else {
        setAlertMessage(responseData.message || "An error occurred");
        setShowAlertSuccess(false);
        setShowAlertError(true);
        setTimeout(() => setShowAlertError(null), 3000);
      }
    } catch (error) {
      setAlertMessage(error.message || "An error occurred");
      setShowAlertSuccess(false);
      setShowAlertError(true);
      setTimeout(() => setShowAlertError(null), 3000);
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
        <img
          src={cartDetails?.storeImage}
          alt="store-image"
          style={{
            width: "50px",
            height: "50px",
          }}
        />
        <p>You are ordering from: {cartDetails?.storeName}</p>
        {cartDetails?.cartItems?.length > 0 && (
          <>
            <h1 className="text-center mb-4">Product Listing</h1>
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {cartDetails?.cartItems?.map((product, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <img
                        src={product?.images[0]}
                        alt="product-image"
                        style={{
                          width: "50px",
                          height: "50px",
                        }}
                      />
                    </td>
                    <td>{product?.enName}</td>
                    <td>{product?.price}</td>
                    <td>{product?.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
        <p className="text-start">
          <b>Sub Total</b>: {cartDetails?.subtotal}
        </p>
        <p className="text-start">
          <b>Delivery Fee</b>: {cartDetails?.deliveryFee}
        </p>
        <p className="text-start">
          <b>Grand Total</b>: {cartDetails?.grandTotal}
        </p>

        <h2>Select an Address</h2>
        {addresses.length > 0 ? (
          <div className="mb-3">
            {addresses.map((address) => (
              <div
                key={address._id}
                className="form-check d-flex align-items-start gap-3"
              >
                <input
                  type="radio"
                  className="form-check-input"
                  name="selectedAddress"
                  value={address._id}
                  checked={selectedAddress === address._id}
                  onChange={() => setSelectedAddress(address._id)}
                />
                <label className="form-check-label">{address.address}</label>
              </div>
            ))}
          </div>
        ) : (
          <div className="d-flex flex-column align-items-center justify-content-center my-5">
            <p>No addresses found. Please add an address first.</p>
            <Link to="/address" className="btn btn-primary">
              Add Adress
            </Link>
          </div>
        )}

        <h2>Scheduling Order</h2>
        <div className="mb-3">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            timeFormat="h:mm aa"
            timeIntervals={30}
            minDate={new Date()}
            className="form-control"
            placeholderText="Select date & time"
          />
        </div>

        <button
          className="btn btn-primary"
          onClick={() => handleCheckout(cartDetails.cartId)}
        >
          Handle Checkout
        </button>
      </div>
    </Container>
  );
};

export default OrderPlace;
