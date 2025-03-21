import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Modal,
  Badge,
} from "react-bootstrap";
import { Formik } from "formik";
import { MdCancel } from "react-icons/md";
import QuillEditor from "../components/quill-editor";
import SuccessAlert from "../components/success-alert";
import ErrorAlert from "../components/error-alert";
import CategorySelector from "../components/category-selector";
import LabelSelector from "../components/label-selector";

const serverBaseUrl = process.env.REACT_APP_BACKEND_SERVER_URL;

function Product() {
  const initialValues = {
    sku: "",
    enName: "",
    frName: "",
    enDescription: "",
    frDescription: "",
    categories: "",
    price: null,
    costPrice: null,
    compareAtPrice: null,
    chargeTax: false,
    chargeTaxValue: 0,
    status: "active",
    availability: "in-stock",
    orderQuantity: false,
    minQuantity: 0,
    maxQuantity: 0,
    enableInventory: false,
    inventory: 0,
    labels: [],
    tags: [],
    enableOption: false,
    enOptionName: "",
    frOptionName: "",
    optionType: "single",
    optionRequired: false,
  };

  const [errors, setErrors] = useState(false);
  const [showAlertSuccess, setShowAlertSuccess] = useState(false);
  const [showAlertError, setShowAlertError] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showFormAlertError, setShowFormAlertError] = useState(false);

  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [categoryReset, setCategoryReset] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [labelReset, setLabelReset] = useState(false);
  const [labels, setLabels] = useState([]);
  const [type, setType] = useState("Single");
  const [variants, setVariants] = useState([
    { enVariantName: "", frVariantName: "", price: 0, costPrice: 0 },
  ]);
  const [images, setImages] = useState([]);
  const navigate = useNavigate("");

  useEffect(() => {
    fetchLabels();
    fetchCategories();
  }, []);

  const handleProductSubmit = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      setErrors({});
      const formData = new FormData();
      formData.append("enName", values.enName);
      formData.append("frName", values.frName);
      formData.append("sku", values.sku);
      formData.append("enDescription", values.enDescription);
      formData.append("frDescription", values.frDescription);
      formData.append("categories", values.categories);
      formData.append("price", values.price);
      formData.append("costPrice", values.costPrice);
      formData.append("compareAtPrice", values.compareAtPrice);
      formData.append("chargeTax", values.chargeTax);
      if (values.chargeTax) {
        formData.append("chargeTaxValue", values.chargeTaxValue);
      }
      formData.append("status", values.status);
      formData.append("availability", values.availability);
      formData.append("orderQuantity", values.orderQuantity);
      if (values.orderQuantity) {
        formData.append("minQuantity", values.minQuantity);
        if (values.maxQuantity > 0) {
          formData.append("maxQuantity", values.maxQuantity);
        }
      }
      formData.append("enableInventory", values.enableInventory);
      if (values.enableInventory) {
        formData.append("inventory", values.inventory);
      }
      formData.append("tags", [values.tags]);
      formData.append("labels", values.labels);
      images?.forEach((image) => {
        formData.append("productImages", image);
      });
      formData.append("enableOption", values.enableOption);
      if (values.enableOption) {
        formData.append("enOptionName", values.enOptionName);
        formData.append("frOptionName", values.frOptionName);
        formData.append("optionType", values.optionType);
        formData.append("optionRequired", values.optionRequired);
        formData.append("variants", JSON.stringify(variants));
      }

      const response = await fetch(`${serverBaseUrl}/merchant/product`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const responseData = await response.json();
      if (response.ok) {
        setShowAlertSuccess(true);
        setShowAlertError(false);
        setAlertMessage(responseData.message);
        resetForm();
        setCategoryReset((prev) => !prev);
        setLabelReset((prev) => !prev);
        setImages([]);
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

  const handleAddCategory = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      setErrors();
      const response = await fetch(`${serverBaseUrl}/merchant/category`, {
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
        setShowFormAlertError(false);
        setAlertMessage(responseData.message);
        setShowCategoryForm(false);
        fetchCategories();
        resetForm();
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

  const handleAddLabel = async (values, { setSubmitting, resetForm }) => {
    setSubmitting(true);
    try {
      setErrors();
      const response = await fetch(`${serverBaseUrl}/merchant/label`, {
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
        setShowFormAlertError(false);
        setAlertMessage(responseData.message);
        setShowLabelForm(false);
        fetchLabels();
        resetForm();
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

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${serverBaseUrl}/merchant/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        setCategories(responseData.response?.data || []);
      } else {
        console.error("Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const fetchLabels = async () => {
    try {
      const response = await fetch(`${serverBaseUrl}/merchant/label`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const responseData = await response.json();
      if (response.ok) {
        setLabels(responseData.response?.data || []);
      } else {
        console.error("Failed to fetch addresses");
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
    if (e.target.value === "Single") {
      setVariants([
        { id: 1, enVariantName: "", frVariantName: "", price: 0, costPrice: 0 },
      ]);
    }
  };

  const addVariant = () => {
    if (type === "multiple") {
      setVariants([
        ...variants,
        {
          enVariantName: "",
          frVariantName: "",
          price: 0,
          costPrice: 0,
        },
      ]);
    }
  };

  const deleteVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prevImages) => [...prevImages, ...files]);
  };

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  };

  return (
    <Container className="pt-3 pb-5">
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
      <div className="form-container">
        <Formik initialValues={initialValues} onSubmit={handleProductSubmit}>
          {({
            handleSubmit,
            handleChange,
            values,
            touched,
            setFieldValue,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>SKU</Form.Label>
                    <Form.Control
                      type="text"
                      name="sku"
                      placeholder="Enter Product SKU"
                      value={values?.sku}
                      onChange={handleChange}
                      isInvalid={touched?.sku && !!errors?.SKU}
                    />
                    {errors?.sku && (
                      <div className="text-danger">{errors?.sku[0]}</div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>Product English Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="enName"
                      placeholder="Enter Product English Name"
                      value={values?.enName}
                      onChange={handleChange}
                      isInvalid={touched?.enName && !!errors?.enName}
                    />
                    {errors?.enName && (
                      <div className="text-danger">{errors?.enName[0]}</div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>Product French Name*</Form.Label>
                    <Form.Control
                      type="text"
                      name="frName"
                      placeholder="Enter Product French Name"
                      value={values?.frName}
                      onChange={handleChange}
                      isInvalid={touched?.frName && !!errors?.frName}
                    />
                    {errors?.frName && (
                      <div className="text-danger">{errors?.frName[0]}</div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>English Description</Form.Label>
                    <QuillEditor
                      value={values?.enDescription}
                      onChange={(content) =>
                        setFieldValue("enDescription", content)
                      }
                    />
                    {touched.enDescription && errors?.enDescription && (
                      <div className="text-danger">
                        {errors.enDescription[0]}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 text-start">
                    <Form.Label>French Description</Form.Label>
                    <QuillEditor
                      value={values?.frDescription}
                      onChange={(content) =>
                        setFieldValue("frDescription", content)
                      }
                    />
                    {touched?.frDescription && errors?.frDescription && (
                      <div className="text-danger">
                        {errors?.frDescription[0]}
                      </div>
                    )}
                  </Form.Group>

                  <CategorySelector
                    categories={categories}
                    categoryReset={categoryReset}
                    setFieldValue={setFieldValue}
                    setShowCategoryForm={setShowCategoryForm}
                  />
                  {errors?.categories && (
                    <div className="text-danger">{errors?.categories[0]}</div>
                  )}

                  <div className="pricing-section">
                    <h5>Pricing</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3 d-flex align-items-start flex-column">
                          <Form.Label>Price</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <Form.Control
                              type="number"
                              name="price"
                              value={values?.price}
                              onChange={handleChange}
                              isInvalid={touched?.price && !!errors?.price}
                            />
                          </div>
                          {errors?.price && (
                            <div className="text-danger">
                              {errors?.price[0]}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3 d-flex align-items-start flex-column">
                          <Form.Label>Compare-at price</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <Form.Control
                              type="number"
                              name="compareAtPrice"
                              value={values?.compareAtPrice}
                              onChange={handleChange}
                              isInvalid={
                                touched?.compareAtPrice &&
                                !!errors?.compareAtPrice
                              }
                            />
                          </div>
                          {errors?.compareAtPrice && (
                            <div className="text-danger">
                              {errors?.compareAtPrice[0]}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3 d-flex align-items-start flex-column">
                          <Form.Label>Cost Price</Form.Label>
                          <div className="input-group">
                            <span className="input-group-text">$</span>
                            <Form.Control
                              type="number"
                              name="costPrice"
                              value={values?.costPrice}
                              onChange={handleChange}
                              isInvalid={
                                touched?.costPrice && !!errors?.costPrice
                              }
                            />
                          </div>
                          {errors?.costPrice && (
                            <div className="text-danger">
                              {errors?.costPrice[0]}
                            </div>
                          )}
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3 d-flex align-items-start flex-column">
                          <Form.Label>Profit</Form.Label>
                          <Form.Control
                            type="text"
                            value={`$ ${
                              Number(values?.price) -
                                Number(values?.costPrice) || 0
                            }`}
                            disabled
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <div className="d-flex gap-2">
                      <Form.Check
                        type="checkbox"
                        label="Charge tax on this product"
                        name="chargeTax"
                        checked={values?.chargeTax}
                        onChange={handleChange}
                        className="w-25"
                      />
                      {values?.chargeTax && (
                        <Form.Group className="col-md-2 col-4 mb-3 d-flex align-items-start flex-column">
                          <Form.Control
                            type="number"
                            name="chargeTaxValue"
                            value={values?.chargeTaxValue || 0}
                            onChange={handleChange}
                            isInvalid={
                              touched?.chargeTaxValue &&
                              !!errors?.chargeTaxValue
                            }
                          />
                        </Form.Group>
                      )}
                      <span>%</span>
                    </div>
                    {errors?.chargeTaxValue && (
                      <div className="text-danger">
                        {errors?.chargeTaxValue[0]}
                      </div>
                    )}
                  </div>
                </Col>

                <Col md={4}>
                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>Availability</Form.Label>
                    <Form.Select
                      name="availability"
                      value={values?.availability}
                      onChange={handleChange}
                      isInvalid={
                        touched?.availability && !!errors?.availability
                      }
                    >
                      <option value="in-stock">In Stock</option>
                      <option value="out-of-stock">Out of Stock</option>
                    </Form.Select>
                    {errors?.availability && (
                      <div className="text-danger">
                        {errors?.availability[0]}
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={values?.status}
                      onChange={handleChange}
                      isInvalid={touched?.status && !!errors?.status}
                    >
                      <option value="active">Active</option>
                      <option value="in-active">Inactive</option>
                    </Form.Select>
                    {errors?.status && (
                      <div className="text-danger">{errors?.status[0]}</div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Check
                      type="switch"
                      label="Order Quantity"
                      name="orderQuantity"
                      checked={values?.orderQuantity}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  {values?.orderQuantity && (
                    <div className="d-flex gap-3">
                      <Form.Group className="col-md-6 mb-3 d-flex align-items-start flex-column">
                        <Form.Label>Minimum Qty.*</Form.Label>
                        <Form.Control
                          type="number"
                          name="minQuantity"
                          value={values?.minQuantity || 0}
                          onChange={handleChange}
                          isInvalid={
                            touched?.minQuantity && !!errors?.minQuantity
                          }
                        />
                        {errors?.minQuantity && (
                          <div className="text-danger">
                            {errors?.minQuantity[0]}
                          </div>
                        )}
                      </Form.Group>
                      <Form.Group className="col-md-6 mb-3 d-flex align-items-start flex-column">
                        <Form.Label>Maximum Qty.</Form.Label>
                        <Form.Control
                          type="number"
                          name="maxQuantity"
                          value={values?.maxQuantity || 0}
                          onChange={handleChange}
                          isInvalid={
                            touched?.maxQuantity && !!errors?.maxQuantity
                          }
                        />
                        {errors?.maxQuantity && (
                          <div className="text-danger">
                            {errors?.maxQuantity[0]}
                          </div>
                        )}
                      </Form.Group>
                    </div>
                  )}

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Check
                      type="switch"
                      label="Enable Inventory"
                      name="enableInventory"
                      checked={values?.enableInventory}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  {values?.enableInventory && (
                    <Form.Group className="mb-3 d-flex align-items-start flex-column">
                      <Form.Control
                        type="number"
                        name="inventory"
                        value={values?.inventory || 0}
                        onChange={handleChange}
                        isInvalid={touched?.inventory && !!errors?.inventory}
                      />
                      {errors?.inventory && (
                        <div className="text-danger">
                          {errors?.inventory[0]}
                        </div>
                      )}
                    </Form.Group>
                  )}

                  <LabelSelector
                    labels={labels}
                    labelReset={labelReset}
                    setFieldValue={setFieldValue}
                    setShowLabelForm={setShowLabelForm}
                  />
                  {errors?.labels && (
                    <div className="text-danger">{errors?.labels[0]}</div>
                  )}

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>Tags</Form.Label>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      {values?.tags?.map((tag, index) => (
                        <Badge key={index} bg="dark" className="p-2">
                          {tag}{" "}
                          <span
                            className="ms-2"
                            style={{ cursor: "pointer" }}
                            onClick={() =>
                              setFieldValue(
                                "tags",
                                values?.tags?.filter((t, i) => i !== index)
                              )
                            }
                          >
                            <Badge bg="secondary">x</Badge>
                          </span>
                        </Badge>
                      ))}
                    </div>
                    <Form.Control
                      type="text"
                      name="tagInput"
                      value={values?.tagInput}
                      onChange={handleChange}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && values?.tagInput?.trim()) {
                          setFieldValue("tags", [
                            ...values.tags,
                            values?.tagInput?.trim(),
                          ]);
                          setFieldValue("tagInput", "");
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors?.tags && (
                      <div className="text-danger">{errors?.tags[0]}</div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3 d-flex align-items-start flex-column">
                    <Form.Label>Image</Form.Label>
                    <Form.Control
                      type="file"
                      name="images"
                      multiple
                      onChange={handleFileChange}
                    />
                    <small className="text-start">
                      Images (AR/3D, Animations, PNG, JPG, GLB, GLTF, SVG, etc.)
                    </small>
                  </Form.Group>
                  <Row>
                    {images.map((image, index) => (
                      <Col key={index} md={3} className="mb-2">
                        <div className="position-relative">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`preview-${index}`}
                            style={{
                              width: "100%",
                              height: "auto",
                              maxHeight: "150px",
                              objectFit: "cover",
                            }}
                          />
                          <Button
                            variant="transparent"
                            size="sm"
                            className="position-absolute top-0 end-0 m-1 d-inline-flex align-items-center justify-content-center p-0 border-0"
                            style={{
                              width: "auto",
                              height: "auto",
                              minWidth: "auto",
                              minHeight: "auto",
                            }}
                            onClick={() => removeImage(index)}
                          >
                            <MdCancel color="red" size={22} />
                          </Button>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>

              <Form.Group className="mb-3 d-flex align-items-start flex-column">
                <Form.Check
                  type="switch"
                  label="Enable Option"
                  name="enableOption"
                  checked={values?.enableOption}
                  onChange={handleChange}
                />
              </Form.Group>
              {values?.enableOption && (
                <Col md={8} className="border rounded-3 mt-5">
                  <p className="bg-black text-white text-start px-3">
                    Variants
                  </p>
                  <h5 className="my-4 fw-bold">OPTIONS</h5>
                  <div className="card p-3 m-3 border-black rounded-3">
                    <Form.Group className="mb-3 d-flex align-items-start flex-column">
                      <Form.Label>Option Name (English) </Form.Label>
                      <Form.Control
                        type="text"
                        name="enOptionName"
                        placeholder="Enter Option Name"
                        value={values?.enOptionName}
                        onChange={handleChange}
                        isInvalid={
                          touched?.enOptionName && !!errors?.enOptionName
                        }
                      />
                      {errors?.enOptionName && (
                        <div className="text-danger">
                          {errors?.enOptionName[0]}
                        </div>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3 d-flex align-items-start flex-column">
                      <Form.Label>Option Name (French) </Form.Label>
                      <Form.Control
                        type="text"
                        name="frOptionName"
                        placeholder="Enter Option Name"
                        value={values?.frOptionName}
                        onChange={handleChange}
                        isInvalid={
                          touched?.frOptionName && !!errors?.frOptionName
                        }
                      />
                      {errors?.frOptionName && (
                        <div className="text-danger">
                          {errors?.frOptionName[0]}
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="col-md-6 mb-3 d-flex align-items-start flex-column">
                      <Form.Label>Type</Form.Label>
                      <Form.Select
                        as="select"
                        className="form-select"
                        name="optionType"
                        onChange={(e) => {
                          handleTypeChange(e);
                          setFieldValue("optionType", e.target.value);
                        }}
                      >
                        <option value="single">Single</option>
                        <option value="multiple">Multiple</option>
                      </Form.Select>
                      {errors?.optionType && (
                        <div className="text-danger">
                          {errors?.optionType[0]}
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3 d-flex align-items-start flex-column">
                      <Form.Check
                        type="switch"
                        label="Is Required"
                        name="optionRequired"
                        checked={values?.optionRequired}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    {errors?.variants && (
                      <div className="text-danger">{errors?.variants[0]}</div>
                    )}
                    {variants?.map((variant, index) => (
                      <div key={index} className="border border-black p-3 mb-4">
                        <h5 className="text-start mb-3 fw-bold">
                          Variant {index + 1}
                        </h5>

                        <Form.Group className="mb-3 d-flex align-items-start flex-column">
                          <Form.Label>Variant Name (English)</Form.Label>
                          <Form.Control
                            type="text"
                            name={`variants[${index}].enVariantName`}
                            placeholder="Enter Variant Name in English"
                            value={variant?.enVariantName}
                            onChange={(e) => {
                              const updatedVariants = [...variants];
                              updatedVariants[index].enVariantName =
                                e.target.value;
                              setVariants(updatedVariants);
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 d-flex align-items-start flex-column">
                          <Form.Label>Variant Name (French)</Form.Label>
                          <Form.Control
                            type="text"
                            name={`variants[${index}].frVariantName`}
                            placeholder="Enter Variant Name in French"
                            value={variant?.frVariantName}
                            onChange={(e) => {
                              const updatedVariants = [...variants];
                              updatedVariants[index].frVariantName =
                                e.target.value;
                              setVariants(updatedVariants);
                            }}
                          />
                        </Form.Group>

                        <Row>
                          <Form.Group className="col-md-6 mb-3">
                            <Form.Label>Price</Form.Label>
                            <Form.Control
                              type="number"
                              name={`variants[${index}].price`}
                              value={variant?.price}
                              onChange={(e) => {
                                const updatedVariants = [...variants];
                                updatedVariants[index].price = parseFloat(
                                  e.target.value
                                );
                                setVariants(updatedVariants);
                              }}
                            />
                          </Form.Group>

                          <Form.Group className="col-md-6 mb-3">
                            <Form.Label>Cost Price</Form.Label>
                            <Form.Control
                              type="number"
                              name={`variants[${index}].costPrice`}
                              value={variant?.costPrice}
                              onChange={(e) => {
                                const updatedVariants = [...variants];
                                updatedVariants[index].costPrice = parseFloat(
                                  e.target.value
                                );
                                setVariants(updatedVariants);
                              }}
                            />
                          </Form.Group>

                          <Button
                            variant="danger"
                            type="button"
                            onClick={() => deleteVariant(index)}
                          >
                            Delete Variant
                          </Button>
                        </Row>
                      </div>
                    ))}

                    {type === "multiple" && (
                      <Button
                        variant="link"
                        className="text-primary"
                        type="button"
                        onClick={addVariant}
                      >
                        + Add More Variant
                      </Button>
                    )}
                  </div>
                </Col>
              )}
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                Submit
              </Button>
            </Form>
          )}
        </Formik>
      </div>

      {/* Label Modal  */}
      <Formik
        initialValues={{
          enName: "",
          frName: "",
        }}
        onSubmit={handleAddLabel}
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
            show={showLabelForm}
            onHide={() => {
              setShowLabelForm(false);
              resetForm();
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add label</Modal.Title>
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
                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>English Label Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="enName"
                    value={values?.enName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.enName && (
                    <p className="joi-error-message">{errors?.enName[0]}</p>
                  )}
                </Form.Group>
                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>French Label Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="frName"
                    value={values?.frName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.frName && (
                    <p className="joi-error-message">{errors?.frName[0]}</p>
                  )}
                </Form.Group>
                <Button disabled={isSubmitting} variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </Formik>

      {/* Category Modal  */}
      <Formik
        initialValues={{
          enName: "",
          frName: "",
          sort: null,
        }}
        onSubmit={handleAddCategory}
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
            show={showCategoryForm}
            onHide={() => {
              setShowCategoryForm(false);
              resetForm();
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>Add Category</Modal.Title>
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
                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>Category English Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="enName"
                    value={values?.enName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.enName && (
                    <p className="joi-error-message">{errors?.enName[0]}</p>
                  )}
                </Form.Group>
                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>Category French Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="frName"
                    value={values?.frName || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.frName && (
                    <p className="joi-error-message">{errors?.frName[0]}</p>
                  )}
                </Form.Group>
                <Form.Group className="mb-3 d-flex align-items-start flex-column">
                  <Form.Label>Sort</Form.Label>
                  <Form.Control
                    type="number"
                    name="sort"
                    value={values?.sort || ""}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors?.sort && (
                    <p className="joi-error-message">{errors?.sort[0]}</p>
                  )}
                </Form.Group>
                <Button disabled={isSubmitting} variant="primary" type="submit">
                  Submit
                </Button>
              </Form>
            </Modal.Body>
          </Modal>
        )}
      </Formik>
    </Container>
  );
}

export default Product;
