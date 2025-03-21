import React, { useEffect, useState } from "react";
import { Form, Button, Badge } from "react-bootstrap";

const CategorySelector = ({
  categories,
  categoryReset,
  setFieldValue,
  setShowCategoryForm,
  values,
}) => {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleCategorySelect = (event) => {
    const selectedId = event.target.value;
    if (
      selectedId &&
      !selectedCategories.some((category) => category?._id === selectedId)
    ) {
      const selectedCategory = categories.find(
        (category) => category?._id === selectedId
      );
      const updatedCategories = [...selectedCategories, selectedCategory];

      setSelectedCategories(updatedCategories);
      setFieldValue(
        "categories",
        updatedCategories.map((category) => category?._id)
      );
    }
  };

  const removeCategory = (categoryId) => {
    const updatedCategories = selectedCategories.filter(
      (category) => category?._id !== categoryId
    );
    setSelectedCategories(updatedCategories);
    setFieldValue(
      "categories",
      updatedCategories.map((category) => category?._id)
    );
  };

  useEffect(() => {
    if (categoryReset) {
      setSelectedCategories([]);
    }
  }, [categoryReset]);

  useEffect(() => {
    if (selectedCategories.length < 1) {
      if (values?.categories) {
        setSelectedCategories(values?.categories);
      }
    }
  }, [values?.categories]);

  return (
    <Form.Group className="mb-3">
      <Form.Label>Category</Form.Label>
      <div className="d-flex align-items-center position-relative w-100">
        <div
          className="w-75 border rounded px-2 py-1 d-flex flex-wrap align-items-center"
          style={{ minHeight: "38px" }}
        >
          {selectedCategories.map((category) => (
            <Badge
              key={category?._id}
              bg="dark"
              className="me-2 d-flex align-items-center"
              style={{ cursor: "pointer" }}
            >
              {category?.enName}
              {" || "}
              {category?.frName}{" "}
              <span
                onClick={() => removeCategory(category?._id)}
                style={{
                  marginLeft: "5px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                <Badge bg="secondary">x</Badge>
              </span>
            </Badge>
          ))}
          <Form.Select
            className="border-0 flex-grow-1"
            onChange={handleCategorySelect}
            style={{ minWidth: "120px" }}
          >
            <option value="" disabled>
              Search Category
            </option>
            {categories.map((category, index) => (
              <option
                key={index}
                value={category?._id}
                disabled={selectedCategories.some(
                  (selected) => selected?._id === category?._id
                )}
              >
                {category?.enName}
                {" || "}
                {category?.frName}
              </option>
            ))}
          </Form.Select>
        </div>

        <Button
          variant="link"
          className="ms-2"
          onClick={() => setShowCategoryForm(true)}
        >
          Create New
        </Button>
      </div>
    </Form.Group>
  );
};

export default CategorySelector;
