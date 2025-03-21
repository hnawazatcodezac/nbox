import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Form, Button, Container } from "react-bootstrap";
import { Formik, ErrorMessage } from "formik";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import PhoneInput from "react-phone-input-2";
import ErrorAlert from "../components/error-alert";
import SuccessAlert from "../components/success-alert";

const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const MerchantRegister = () => {
  const [errors, setErrors] = useState({});
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setErrors({});

    try {
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (key !== "storeImage") {
          formData.append(key, values[key]);
        }
      });

      if (values.storeImage) {
        formData.append("storeImage", values.storeImage);
      }

      const response = await fetch(`${serverBaseUrl}/user/merchant-register`, {
        method: "POST",
        body: formData,
      });
      const responseData = await response.json();
      if (response.status === 201) {
        setShowAlertSuccess(true);
        setShowAlertError(false);
        setAlertMessage(responseData.message);
        resetForm();
        setTimeout(() => setShowAlertSuccess(false), 3000);
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
        setAlertMessage(responseData.message);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container className="mt-5 pb-4">
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

      <h1 className="text-center mb-4">Sign Up</h1>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          storeName: "",
          companyWebsite: "",
          orderPerMonth: 0,
          businessType: "manufactures",
          phoneNumber: "",
          storeImage: null,
        }}
        onSubmit={handleSubmit}
        enableReinitialize={true}
      >
        {({
          values,
          handleChange,
          handleBlur,
          setFieldValue,
          handleSubmit,
          isSubmitting,
        }) => (
          <Form noValidate onSubmit={handleSubmit}>
            <Row className="justify-content-center">
              <Col md={6}>
                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>
                    First Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values?.firstName}
                    isInvalid={!!errors.firstName}
                  />
                  <ErrorMessage
                    name="firstName"
                    component="div"
                    className="text-danger small"
                  />
                  {errors?.firstName && (
                    <p className="joi-error-message">{errors?.firstName[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>
                    Last Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values?.lastName}
                    isInvalid={!!errors.lastName}
                  />
                  <ErrorMessage
                    name="lastName"
                    component="div"
                    className="text-danger small"
                  />
                  {errors?.lastName && (
                    <p className="joi-error-message">{errors?.lastName[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>
                    Email<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values?.email}
                    isInvalid={!!errors.email}
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-danger small"
                  />
                  {errors?.email && (
                    <p className="joi-error-message">{errors?.email[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>
                    Password<span className="text-danger">*</span>
                  </Form.Label>
                  <div className="position-relative w-100">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter password"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values?.password}
                      isInvalid={!!errors.password}
                    />
                    <div className="icon-div position-absolute">
                      {showPassword ? (
                        <BsEye
                          size={18}
                          color="#8d8d8d"
                          onClick={togglePasswordVisibility}
                          className="eye-icon"
                        />
                      ) : (
                        <BsEyeSlash
                          size={18}
                          color="#8d8d8d"
                          onClick={togglePasswordVisibility}
                          className="eye-icon"
                        />
                      )}
                    </div>
                  </div>
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="text-danger small"
                  />
                  {errors?.password && (
                    <p className="joi-error-message">{errors?.password[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>
                    Store Name<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="storeName"
                    placeholder="Enter store name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.storeName}
                    isInvalid={!!errors.storeName}
                  />
                  <ErrorMessage
                    name="storeName"
                    component="div"
                    className="text-danger small"
                  />
                  {errors?.storeName && (
                    <p className="joi-error-message">{errors?.storeName[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>
                    Company Website<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="companyWebsite"
                    placeholder="Enter company name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values?.companyWebsite}
                    isInvalid={!!errors.companyWebsite}
                  />
                  {errors?.companyWebsite && (
                    <p className="joi-error-message">
                      {errors?.companyWebsite[0]}
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>
                    Order Per Month<span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="orderPerMonth"
                    placeholder="Enter company name"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values?.orderPerMonth}
                    isInvalid={!!errors.orderPerMonth}
                  />
                  {errors?.orderPerMonth && (
                    <p className="joi-error-message">
                      {errors?.orderPerMonth[0]}
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>Business Type</Form.Label>
                  <Form.Select
                    name="businessType"
                    value={values?.businessType}
                    onChange={handleChange}
                    isInvalid={!!errors?.businessType}
                  >
                    <option value="manufactures">Manufactures</option>
                    <option value="distribution">Distribution</option>
                  </Form.Select>
                  {errors?.businessType && (
                    <div className="text-danger">{errors?.businessType[0]}</div>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>Phone Number</Form.Label>
                  <PhoneInput
                    id="phoneNumber"
                    name="phoneNumber"
                    country={"us"}
                    value={values?.phoneNumber}
                    onChange={(value) => {
                      setFieldValue("phoneNumber", value);
                    }}
                    onBlur={handleBlur}
                    placeholder="Enter phone number"
                    autoFormat={true}
                    enableAreaCodes={true}
                    enableSearch={true}
                    containerStyle={{ width: "100%" }}
                    inputStyle={{
                      width: "100%",
                      display: "block",
                      height: "calc(1.5em + .75rem + 2px)",
                      fontSize: "1rem",
                      fontWeight: "400",
                      lineHeight: "1.5",
                      color: "#495057",
                      backgroundColor: "#fff",
                      backgroundClip: "padding-box",
                      border: "1px solid #eee",
                      borderRadius: ".25rem",
                      transition:
                        "border-color .15s ease-in-out, box-shadow .15s ease-in-out",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-danger"
                  />
                  {errors?.phoneNumber && (
                    <p className="joi-error-message">
                      {errors?.phoneNumber[0]}
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>Store Image</Form.Label>
                  <Form.Control
                    type="file"
                    name="storeImage"
                    accept="image/*"
                    onChange={(event) =>
                      setFieldValue("storeImage", event.currentTarget.files[0])
                    }
                    isInvalid={!!errors.storeImage}
                  />
                  {values.storeImage && (
                    <div className="mt-2">
                      <img
                        src={URL.createObjectURL(values.storeImage)}
                        alt="Store Preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  )}
                </Form.Group>

                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  Register
                </Button>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </Container>
  );
};

export default MerchantRegister;
