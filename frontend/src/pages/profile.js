import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Form,
  Button,
  Container,
  Image,
  Modal,
  Alert,
} from "react-bootstrap";
import { MdDeleteOutline, MdEdit } from "react-icons/md";
import { FiCheckCircle } from "react-icons/fi";
import { Formik, ErrorMessage } from "formik";
import { BsEye, BsEyeSlash } from "react-icons/bs";
import PhoneInput from "react-phone-input-2";
import * as Yup from "yup";
import SuccessAlert from "../components/success-alert";
import ErrorAlert from "../components/error-alert";

const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [showFormAlertError, setShowFormAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [role, setRole] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || localStorage.getItem("admin")
    );
    setRole(localStorage.getItem("user") ? "user" : "admin");
    setUser(storedUser);
    fetchAddresses();
  }, []);

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

  const profileValidationSchema = Yup.object({
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
    phoneNumber:
      role === "user"
        ? Yup.string()
            .trim()
            .matches(
              /^[0-9+\-]{10,15}$/,
              "Phone number should be 10 to 15 digits"
            )
            .optional()
            .nullable()
            .test(
              "trim",
              "Phone number may not contain any spaces at the beginning or end",
              (value) => value === (value && value?.trim())
            )
        : Yup.string().notRequired(),
  });

  const passwordValidationSchema = Yup.object({
    currentPassword: Yup.string()
      .min(6, "Password should be between 6 and 30 characters long")
      .max(30, "Password should be between 6 and 30 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{6,30}$/,
        "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .required("Password is required"),
    newPassword: Yup.string()
      .min(6, "Password should be between 6 and 30 characters long")
      .max(30, "Password should be between 6 and 30 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#])[A-Za-z\d@$!%*?&.#]{6,30}$/,
        "Password should contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      )
      .notOneOf(
        [Yup.ref("currentPassword")],
        "New password must be different from the current password"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("newPassword"), null], "Password do not match")
      .required("Confirm password is required"),
  });

  const handleLanguageUpdate = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    setErrors();
    try {
      const response = await fetch(`${serverBaseUrl}/user/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();
      if (response.ok) {
        const updatedUser = responseData.response?.data;
        setUser((prevUser) => {
          const newUser = { ...prevUser, ...updatedUser };
          localStorage.setItem("user", JSON.stringify(newUser));
          return newUser;
        });
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
      } else if (responseData?.error === "jwt expired") {
        setAlertMessage("Your session has expired. Please login again");
        setShowAlertSuccess(false);
        setShowAlertError(true);
        localStorage.clear();
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
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    const dataToSend = {
      firstName: values?.firstName,
      lastName: values?.lastName,
      phoneNumber: values?.phoneNumber,
    };
    try {
      setErrors();
      const response = await fetch(`${serverBaseUrl}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const responseData = await response.json();
      if (response.ok) {
        const updatedUser = responseData.response?.data;
        setUser((prevUser) => {
          const newUser = { ...prevUser, ...updatedUser };
          localStorage.setItem("user", JSON.stringify(newUser));
          return newUser;
        });
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
      } else if (responseData?.error === "jwt expired") {
        setAlertMessage("Your session has expired. Please login again");
        setShowAlertSuccess(false);
        setShowAlertError(true);
        localStorage.clear();
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
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      setErrors();
      const response = await fetch(`${serverBaseUrl}/user/password`, {
        method: "PUT",
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
      } else if (responseData?.error === "jwt expired") {
        setAlertMessage("Your session has expired. Please login again");
        setShowAlertSuccess(false);
        setShowAlertError(true);
        localStorage.clear();
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
    } finally {
      setSubmitting(false);
    }
  };

  const updateDefaultAdress = async (addressId) => {
    try {
      const response = await fetch(
        `${serverBaseUrl}/user/address/${addressId}/default`,
        {
          method: "PUT",
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
      fetchAddresses();
    }
  };

  const handleEdit = (address) => {
    setSelectedAddress(address);
    setShowEditModal(true);
  };

  const handleLocationSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    const dataToSend = {
      city: values?.city,
      country: values?.country,
      postalCode: values?.postalCode,
      state: values?.state,
      address: values?.address,
      addressLatitude: values?.addressLatitude,
      addressLongitude: values?.addressLongitude,
      landmark: values?.landmark,
      landmarkLatitude: values?.landmarkLatitude,
      landmarkLongitude: values?.landmarkLongitude,
      addressType: values?.addressType,
      isDefault: values?.isDefault,
    };
    try {
      setErrors();
      const response = await fetch(
        `${serverBaseUrl}/user/address/${values?.addressId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      const responseData = await response.json();
      if (response.ok) {
        setShowEditModal(false);
        setSelectedAddress([]);
        resetForm();
        setShowAlertSuccess(true);
        setShowFormAlertError(false);
        setAlertMessage(responseData.message);
        resetForm();
        fetchAddresses();
        setTimeout(() => setShowAlertSuccess(false), 3000);
      } else if (response.status === 403) {
        const error = typeof responseData.error;
        if (error === "object") {
          setErrors(responseData.error);
        } else {
          setShowAlertSuccess(false);
          setShowFormAlertError(true);
          setAlertMessage(responseData.message || "An error occurred");
          setTimeout(() => setShowFormAlertError(false), 3000);
        }
      } else if (responseData?.error === "jwt expired") {
        setAlertMessage("Your session has expired. Please login again");
        setShowAlertSuccess(false);
        setShowFormAlertError(true);
        localStorage.clear();
        setTimeout(() => {
          setShowFormAlertError(false);
          navigate("/");
        }, 5000);
      } else {
        setShowAlertSuccess(false);
        setShowFormAlertError(true);
        setAlertMessage(responseData.message);
        setTimeout(() => setShowFormAlertError(false), 3000);
      }
    } catch (error) {
      setShowAlertSuccess(false);
      setShowFormAlertError(true);
      setAlertMessage("Internal server error");
      setTimeout(() => setShowFormAlertError(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const response = await fetch(
        `${serverBaseUrl}/user/address/${addressId}`,
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
      fetchAddresses();
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
        <h1 className="text-center mb-4">Profile Update ({user?.role})</h1>
        <Formik
          initialValues={{
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
            phoneNumber: user?.phoneNumber,
          }}
          validationSchema={profileValidationSchema}
          onSubmit={handleProfileSubmit}
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
                      isInvalid={!!errors?.firstName}
                    />
                    <ErrorMessage
                      name="firstName"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.firstName && (
                      <p className="joi-error-message">
                        {errors?.firstName[0]}
                      </p>
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
                      isInvalid={!!errors?.lastName}
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
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Enter email"
                      onBlur={handleBlur}
                      value={values?.email}
                      disabled
                    />
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
      <hr />
      <div className="my-5">
        <h1 className="text-center mb-4">Language Update ({user?.role})</h1>
        <Formik
          initialValues={{
            language: user?.language || "en",
          }}
          onSubmit={handleLanguageUpdate}
          enableReinitialize={true}
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
                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>
                      Language <span className="text-danger">*</span>
                    </Form.Label>
                    <Form.Select
                      name="language"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values?.language}
                      isInvalid={!!errors?.language}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="zh">Chinese</option>
                      <option value="ar">Arabic</option>
                    </Form.Select>
                    <ErrorMessage
                      name="language"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.language && (
                      <p className="joi-error-message">{errors?.language[0]}</p>
                    )}
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
      <hr />
      <div className="my-5">
        <h1 className="text-center mb-4">Saved Addresses</h1>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>#</th>
              <th>Adress</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Postal Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {addresses.length > 0 ? (
              addresses.map((address, index) => (
                <tr key={address._id}>
                  <td>{index + 1}</td>
                  <td>{address.address}</td>
                  <td>{address.city}</td>
                  <td>{address.state}</td>
                  <td>{address.country}</td>
                  <td>{address.postalCode}</td>
                  <td className="d-flex justify-content-between">
                    <Button
                      variant="none"
                      size="lg"
                      className="p-0"
                      onClick={() => handleEdit(address)}
                    >
                      <MdEdit size={22} color="grey" />
                      <i class="bi bi-check2-circle"></i>
                    </Button>
                    {address.isDefault ? (
                      <Button variant="none" size="lg" className="p-0">
                        <FiCheckCircle size={22} color="lime" />
                      </Button>
                    ) : (
                      <Button
                        variant="none"
                        size="lg"
                        className="p-0"
                        onClick={() => updateDefaultAdress(address._id)}
                      >
                        <FiCheckCircle size={22} color="grey" />
                      </Button>
                    )}
                    <Button
                      variant="none"
                      size="lg"
                      className="p-0"
                      onClick={() => handleDeleteAddress(address._id)}
                    >
                      <MdDeleteOutline size={22} color="red" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">
                  No addresses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Formik
        initialValues={{
          address: selectedAddress?.address,
          city: selectedAddress?.city,
          country: selectedAddress?.country,
          state: selectedAddress?.state,
          postalCode: selectedAddress?.postalCode,
          addressId: selectedAddress?._id,
          addressLatitude: selectedAddress?.addressLongLat?.coordinates[1],
          addressLongitude: selectedAddress?.addressLongLat?.coordinates[0],
          landmark: selectedAddress?.landmark,
          landmarkLatitude: selectedAddress?.landmarkLongLat?.coordinates[1],
          landmarkLongitude: selectedAddress?.landmarkLongLat?.coordinates[0],
          addressType: selectedAddress?.addressType,
          isDefault: selectedAddress?.isDefault,
        }}
        onSubmit={handleLocationSubmit}
        enableReinitialize={true}
      >
        {({
          values,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          resetForm,
        }) => (
          <Modal
            show={showEditModal}
            onHide={() => {
              setShowEditModal(false);
              setSelectedAddress([]);
              resetForm();
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Edit Address</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleSubmit}>
                {showFormAlertError && (
                  <div className="col-12">
                    <Alert
                      variant="danger d-flex align-items-center"
                      role="alert"
                    >
                      <svg
                        className="me-2"
                        id="exclamation-triangle-fill"
                        fill="currentColor"
                        width="20"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"></path>
                      </svg>
                      <div>{alertMessage}</div>
                      <button
                        type="button"
                        className="btn-close ms-auto"
                        data-bs-dismiss="alert"
                        aria-label="Close"
                        onClick={() => setShowFormAlertError(false)}
                      ></button>
                    </Alert>
                  </div>
                )}
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={values?.city || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.city && (
                    <p className="joi-error-message">{errors?.city[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    type="text"
                    name="state"
                    value={values?.state || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.state && (
                    <p className="joi-error-message">{errors?.state[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    type="text"
                    name="country"
                    value={values?.country || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.country && (
                    <p className="joi-error-message">{errors?.country[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    type="text"
                    name="postalCode"
                    value={values?.postalCode || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.postalCode && (
                    <p className="joi-error-message">{errors?.postalCode[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={values?.address || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.address && (
                    <p className="joi-error-message">{errors?.address[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address Latitude</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLatitude"
                    value={values?.addressLatitude || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.addressLatitude && (
                    <p className="joi-error-message">
                      {errors?.addressLatitude[0]}
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Address Longitude</Form.Label>
                  <Form.Control
                    type="text"
                    name="addressLongitude"
                    value={values?.addressLongitude || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.addressLongitude && (
                    <p className="joi-error-message">
                      {errors?.addressLongitude[0]}
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Landmark</Form.Label>
                  <Form.Control
                    type="text"
                    name="landmark"
                    value={values?.landmark || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.landmark && (
                    <p className="joi-error-message">{errors?.landmark[0]}</p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Landmark Latitude</Form.Label>
                  <Form.Control
                    type="text"
                    name="landmarkLatitude"
                    value={values?.landmarkLatitude || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.landmarkLatitude && (
                    <p className="joi-error-message">
                      {errors?.landmarkLatitude[0]}
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Landmark Longitude</Form.Label>
                  <Form.Control
                    type="text"
                    name="landmarkLongitude"
                    value={values?.landmarkLongitude || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.landmarkLongitude && (
                    <p className="joi-error-message">
                      {errors?.landmarkLongitude[0]}
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="mb-3 text-start">
                  <Form.Label>Address Type</Form.Label>
                  <Form.Select
                    name="addressType"
                    value={values.addressType}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Address Type
                    </option>
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </Form.Select>
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
                <Button disabled={isSubmitting} variant="primary" type="submit">
                  Save Changes
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </Formik>
      <hr />
      <div className="my-5">
        <h1 className="text-center mb-4">Password Update ({user?.role})</h1>
        <Formik
          initialValues={{
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={passwordValidationSchema}
          onSubmit={handlePasswordSubmit}
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
                      Current Password<span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative w-100">
                      <Form.Control
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        placeholder="Enter current password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values?.currentPassword}
                        isInvalid={!!values?.errors?.currentPassword}
                      />
                      <div className="icon-div position-absolute">
                        {showCurrentPassword ? (
                          <BsEye
                            size={18}
                            color="#8d8d8d"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="eye-icon"
                          />
                        ) : (
                          <BsEyeSlash
                            size={18}
                            color="#8d8d8d"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="eye-icon"
                          />
                        )}
                      </div>
                    </div>
                    <ErrorMessage
                      name="currentPassword"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.currentPassword && (
                      <p className="joi-error-message">
                        {errors?.currentPassword[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      New Password<span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative w-100">
                      <Form.Control
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        placeholder="Enter new password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values?.newPassword}
                        isInvalid={!!values?.errors?.newPassword}
                      />
                      <div className="icon-div position-absolute">
                        {showNewPassword ? (
                          <BsEye
                            size={18}
                            color="#8d8d8d"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="eye-icon"
                          />
                        ) : (
                          <BsEyeSlash
                            size={18}
                            color="#8d8d8d"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="eye-icon"
                          />
                        )}
                      </div>
                    </div>
                    <ErrorMessage
                      name="newPassword"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.newPassword && (
                      <p className="joi-error-message">
                        {errors?.newPassword[0]}
                      </p>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>
                      Confirm Password<span className="text-danger">*</span>
                    </Form.Label>
                    <div className="position-relative w-100">
                      <Form.Control
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Confirm new password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values?.confirmPassword}
                        isInvalid={!!values?.errors?.confirmPassword}
                      />
                      <div className="icon-div position-absolute">
                        {showConfirmPassword ? (
                          <BsEye
                            size={18}
                            color="#8d8d8d"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="eye-icon"
                          />
                        ) : (
                          <BsEyeSlash
                            size={18}
                            color="#8d8d8d"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="eye-icon"
                          />
                        )}
                      </div>
                    </div>
                    <ErrorMessage
                      name="confirmPassword"
                      component="div"
                      className="text-danger small"
                    />
                    {errors?.confirmPassword && (
                      <p className="joi-error-message">
                        {errors?.confirmPassword[0]}
                      </p>
                    )}
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

export default Profile;
