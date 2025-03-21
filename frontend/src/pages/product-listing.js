import React, { useEffect, useState } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { Button, Container } from "react-bootstrap";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import SuccessAlert from "../components/success-alert";
import ErrorAlert from "../components/error-alert";

const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const ProductListing = () => {
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleToggleAvailability = async (productId, currentAvailability) => {
    const newAvailability =
      currentAvailability === "in-stock" ? "out-of-stock" : "in-stock";
    try {
      const response = await fetch(
        `${serverBaseUrl}/merchant/product/availability/${productId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ availability: newAvailability }),
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setShowAlertSuccess(true);
        setShowAlertError(false);
        setAlertMessage(responseData.message);
        setTimeout(() => setShowAlertSuccess(false), 3000);
      } else {
        setShowAlertSuccess(false);
        setShowAlertError(true);
        setAlertMessage(responseData.message);
        setTimeout(() => setShowAlertError(false), 3000);
      }
    } catch (error) {
      console.error("Error updating availability:", error);
    } finally {
      fetchProducts();
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${serverBaseUrl}/merchant/product`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        setProducts(responseData.response?.data || []);
      } else if (response.status === 404) {
        setProducts([]);
      } else {
        console.error("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const handleDeleteProducts = async (productId) => {
    try {
      const response = await fetch(
        `${serverBaseUrl}/merchant/product/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const responseData = await response.json();
      if (response.status === 200) {
        setShowAlertSuccess(true);
        setShowAlertError(false);
        setAlertMessage(responseData.message);
        setTimeout(() => setShowAlertSuccess(false), 3000);
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
      fetchProducts();
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
        <h1 className="text-center mb-4">Products Listing</h1>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>English Name</th>
              <th>French Name</th>
              <th>English Category</th>
              <th>French Category</th>
              <th>price</th>
              <th>Availability</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.length > 0 ? (
              products?.map((product, index) => (
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
                  <td>{product?.frName}</td>
                  <td>
                    {product?.categories.length > 0
                      ? product?.categories?.map((category, index) => (
                          <span key={index}>
                            {category?.enName} <br />
                          </span>
                        ))
                      : ""}
                  </td>
                  <td>
                    {product?.categories.length > 0
                      ? product?.categories?.map((category, index) => (
                          <span key={index}>
                            {category?.frName} <br />
                          </span>
                        ))
                      : ""}
                  </td>
                  <td>{product?.price}</td>
                  <td>
                    {product?.availability === "out-of-stock"
                      ? "Out of Stock"
                      : "In Stock"}
                  </td>
                  <td>
                    <div class="form-check form-switch d-flex align-items-center justify-content-between">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="flexSwitchCheckDefault"
                        checked={product?.availability === "in-stock"}
                        onChange={() =>
                          handleToggleAvailability(
                            product._id,
                            product.availability
                          )
                        }
                      />
                      <Button
                        as={Link}
                        to={`/product-details/${product._id}`}
                        variant="none"
                        size="lg"
                        className="p-0"
                      >
                        <MdEdit size={22} color="grey" />
                        <i className="bi bi-check2-circle"></i>
                      </Button>
                      <Button
                        variant="none"
                        size="lg"
                        className="p-0"
                        onClick={() => handleDeleteProducts(product._id)}
                      >
                        <MdDeleteOutline size={22} color="red" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No product found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Container>
  );
};

export default ProductListing;
