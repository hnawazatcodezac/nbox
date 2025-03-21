import React from "react";
import { Alert } from "react-bootstrap";

const SuccessAlert = ({ alertMessage, setShowAlertSuccess }) => {
  return (
    <div className="p-3 pb-0 col-lg-6 col-md-8 col-sm-10 position-fixed z-3" style={{top:"3%"}}>
      <Alert variant="success d-flex align-items-center" role="alert">
        <svg
          className="me-2"
          id="check-circle-fill"
          width="20"
          fill="currentColor"
          viewBox="0 0 16 16"
        >
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"></path>
        </svg>
        <div>{alertMessage}</div>
        <button
          type="button"
          className="btn-close ms-auto"
          data-bs-dismiss="alert"
          aria-label="Close"
          onClick={() => setShowAlertSuccess(false)}
        ></button>
      </Alert>
    </div>
  );
};

export default SuccessAlert;
