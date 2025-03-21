import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Form, Button, Container } from "react-bootstrap";
import { Formik, ErrorMessage } from "formik";
import SuccessAlert from "../components/success-alert";
import ErrorAlert from "../components/error-alert";

const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const Address = () => {
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleAddressSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      setErrors({});
      const response = await fetch(`${serverBaseUrl}/user/address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();
      if (response.ok) {
        setShowAlertSuccess(true);
        setShowAlertError(false);
        setAlertMessage(responseData.message);
        resetForm();
        setTimeout(() => {
          setShowAlertSuccess(false);
          navigate("/profile");
        }, 3000);
      } else if (response.status === 403) {
        const error = typeof responseData.error;
        if (error === "object") {
          setErrors(responseData.error);
        } else {
          setShowAlertSuccess(false);
          setShowAlertError(true);
          setAlertMessage(responseData.message || "An error occurred");
          setTimeout(() => setShowAlertError(false), 3000);
        }
      } else {
        setShowAlertSuccess(false);
        setShowAlertError(true);
        setAlertMessage(responseData.message || "An error occurred");
        setTimeout(() => setShowAlertError(false), 3000);
      }
    } catch (error) {
      setShowAlertSuccess(false);
      setShowAlertError(true);
      setAlertMessage("Internal server error");
      setTimeout(() => setShowAlertError(false), 3000);
    } finally {
      setSubmitting(false);
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
        <h1 className="text-center mb-4">Add Address</h1>
        <Formik
          initialValues={{
            city: "",
            state: "",
            postalCode: "",
            country: "",
            address: "",
            addressLatitude: "",
            addressLongitude: "",
            landmark: "",
            landmarkLatitude: "",
            landmarkLongitude: "",
            addressType: "",
            isDefault: false,
          }}
          onSubmit={handleAddressSubmit}
        >
          {({
            values,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Row className="justify-content-center">
                <Col md={6}>
                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      City<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      placeholder="Enter City"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.city}
                      isInvalid={!!errors.city}
                    />
                    <ErrorMessage
                      name="city"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.city && (
                      <p className="joi-error-message">{errors?.city[0]}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      State<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      placeholder="Enter State"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.state}
                      isInvalid={!!errors.state}
                    />
                    <ErrorMessage
                      name="state"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.state && (
                      <p className="joi-error-message">{errors?.state[0]}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Country<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      placeholder="Enter Country"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.country}
                      isInvalid={!!errors.country}
                    />
                    <ErrorMessage
                      name="country"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.country && (
                      <p className="joi-error-message">{errors?.country[0]}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Postal Code<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="postalCode"
                      placeholder="Enter Postal Code"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.postalCode}
                      isInvalid={!!errors.postalCode}
                    />
                    <ErrorMessage
                      name="postalCode"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.postalCode && (
                      <p className="joi-error-message">
                        {errors?.postalCode[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Address<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      placeholder="Enter Address"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.address}
                      isInvalid={!!errors.address}
                    />
                    <ErrorMessage
                      name="address"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.address && (
                      <p className="joi-error-message">{errors?.address[0]}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Adress Latitude<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="addressLatitude"
                      placeholder="Enter Latitude"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.addressLatitude}
                      isInvalid={!!errors.addressLatitude}
                    />
                    {errors?.addressLatitude && (
                      <p className="joi-error-message">
                        {errors?.addressLatitude[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Adress Longitude<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="addressLongitude"
                      placeholder="Enter Longitude"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.addressLongitude}
                      isInvalid={!!errors.addressLongitude}
                    />
                    {errors?.addressLongitude && (
                      <p className="joi-error-message">
                        {errors?.addressLongitude[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Landmark<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="landmark"
                      placeholder="Enter Address"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.landmark}
                      isInvalid={!!errors.landmark}
                    />
                    <ErrorMessage
                      name="landmark"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.landmark && (
                      <p className="joi-error-message">{errors?.landmark[0]}</p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Landmark Latitude<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="landmarkLatitude"
                      placeholder="Enter Latitude"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.landmarkLatitude}
                      isInvalid={!!errors.landmarkLatitude}
                    />
                    <ErrorMessage
                      name="landmarkLatitude"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.landmarkLatitude && (
                      <p className="joi-error-message">
                        {errors?.landmarkLatitude[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Landmark Longitude<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="landmarkLongitude"
                      placeholder="Enter Longitude"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.landmarkLongitude}
                      isInvalid={!!errors.landmarkLongitude}
                    />
                    <ErrorMessage
                      name="landmarkLongitude"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.landmarkLongitude && (
                      <p className="joi-error-message">
                        {errors?.landmarkLongitude[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>
                      Adress Type<span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="addressType"
                      value={values.addressType}
                      onChange={handleChange}
                      isInvalid={!!errors?.addressType}
                    >
                      <option value="" disabled>
                        Select Adress Type
                      </option>
                      <option value="home">Home</option>
                      <option value="office">Office</option>
                      <option value="other">other</option>
                    </Form.Select>
                    {errors?.addressType && (
                      <p className="joi-error-message">
                        {errors?.addressType[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Check
                      type="checkbox"
                      label="Set as Default Address"
                      name="isDefault"
                      checked={values.isDefault}
                      onChange={handleChange}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmitting}
                  >
                    Submit
                  </Button>
                </Col>
              </Row>
            </Form>
          )}
        </Formik>
      </div>
    </Container>
  );
};

export default Address;
