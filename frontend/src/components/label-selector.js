import React, { useEffect, useState } from "react";
import { Form, Button, Badge } from "react-bootstrap";

const LabelSelector = ({
  labels,
  labelReset,
  setFieldValue,
  setShowLabelForm,
  values,
}) => {
  const [selectedLabels, setSelectedLabels] = useState([]);

  const handleLabelSelect = (event) => {
    const selectedId = event.target.value;
    if (
      selectedId &&
      !selectedLabels.some((label) => label?._id === selectedId)
    ) {
      const selectedLabel = labels.find((label) => label?._id === selectedId);
      const updatedLabels = [...selectedLabels, selectedLabel];

      setSelectedLabels(updatedLabels);
      setFieldValue(
        "labels",
        updatedLabels.map((label) => label?._id)
      );
    }
  };

  const removeLabel = (labelId) => {
    const updatedLabels = selectedLabels.filter(
      (label) => label?._id !== labelId
    );
    setSelectedLabels(updatedLabels);
    setFieldValue(
      "labels",
      updatedLabels.map((label) => label?._id)
    );
  };

  useEffect(() => {
    if (labelReset) {
      setSelectedLabels([]);
    }
  }, [labelReset]);

  useEffect(() => {
    if (selectedLabels?.length < 1) {
      if (values?.labels) {
        setSelectedLabels(values?.labels);
      }
    }
  }, [values]);

  return (
    <Form.Group className="mb-3">
      <Form.Label>Label</Form.Label>
      <div className="d-flex align-items-center position-relative w-100">
        <div
          className="w-75 border rounded px-2 py-1 d-flex flex-wrap align-items-center"
          style={{ minHeight: "38px" }}
        >
          {selectedLabels?.map((label) => (
            <Badge
              key={label?._id}
              bg="dark"
              className="me-2 d-flex align-items-center"
              style={{ cursor: "pointer" }}
            >
              {label?.enName}
              {" || "}
              {label?.frName}
              <span
                onClick={() => removeLabel(label?._id)}
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
            onChange={handleLabelSelect}
            style={{ minWidth: "120px" }}
          >
            <option value="" disabled>
              Search Label
            </option>
            {labels?.map((label, index) => (
              <option
                key={index}
                value={label?._id}
                disabled={selectedLabels?.some(
                  (selected) => selected?._id === label?._id
                )}
              >
                {label?.enName} {" || "} {label?.frName}
              </option>
            ))}
          </Form.Select>
        </div>

        <Button
          variant="link"
          className="ms-2"
          onClick={() => setShowLabelForm(true)}
        >
          Create New
        </Button>
      </div>
    </Form.Group>
  );
};

export default LabelSelector;
