import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { Row, Col, Form, Button, Container } from "react-bootstrap";
import { Formik, ErrorMessage } from "formik";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import PhoneInput from "react-phone-input-2";
import * as Yup from "yup";
import ErrorAlert from "../components/error-alert";
import SuccessAlert from "../components/success-alert";
const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const UserRegister = () => {
  const location = useLocation()
  const [errors, setErrors] = useState({});
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const validationSchema = Yup.object({
    firstName: Yup.string()
      .min(1, "First name must be at least 1 characters long")
      .max(70, "First name must not exceed 70 characters")
      .trim()
      .test(
        "starts-with-letter",
        "First name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        (value) => {
          if (!value) return false;
          return /^[^\p{N}]/u.test(value);
        }
      )
      .required("First name is required"),
    lastName: Yup.string()
      .min(1, "Last name must be at least 1 characters long")
      .max(70, "Last name must not exceed 70 characters")
      .trim()
      .test(
        "starts-with-letter",
        "Last name must start with a letter and can include numbers, spaces, but cannot be entirely numbers",
        (value) => {
          if (!value) return false;
          return /^[^\p{N}]/u.test(value);
        }
      )
      .required("Last name is required"),
    email: Yup.string()
      .trim()
      .required("Email is required")
      .email("Enter a valid email address")
      .test(
        "no-spaces",
        "Email should not contain any spaces at the beginning or end",
        (value) => {
          return value === undefined || value.trim() === value;
        }
      )
      .test(
        "min-domain-segments",
        "Email should have at least two domain segments",
        (value) => {
          if (!value) return true;
          const segments = value.split("@");
          return (
            segments.length === 2 &&
            segments[1].split(".").length >= 2 &&
            segments[1].split(".").every((segment) => segment.length >= 2)
          );
        }
      ),
    password: Yup.string()
      .min(6, "Password should be between 6 and 30 characters long")
      .max(30, "Password should be between 6 and 30 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{6,30}$/,
        "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required("Password is required"),
    phoneNumber: Yup.string()
      .trim()
      .matches(/^[0-9+\-]{10,15}$/, "Phone number should be 10 to 15 digits")
      .optional()
      .nullable()
      .test(
        "trim",
        "Phone number may not contain any spaces at the beginning or end",
        (value) => value === (value && value.trim())
      ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setErrors({});
    try {
      const response = await fetch(`${serverBaseUrl}/user/buyer-register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...values }),
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
          phoneNumber: "",
        }}
        validationSchema={validationSchema}
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

export default UserRegister;
