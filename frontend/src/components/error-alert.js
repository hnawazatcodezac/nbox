import React from "react";
import { Alert } from "react-bootstrap";

const ErrorAlert = ({ alertMessage, setShowAlertError }) => {
  return (
    <div className="p-3 pb-0 col-lg-6 col-md-8 col-sm-10 position-fixed z-3" style={{top:"3%"}}>
      <Alert variant="danger d-flex align-items-center" role="alert">
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
          onClick={() => setShowAlertError(false)}
        ></button>
      </Alert>
    </div>
  );
};

export default ErrorAlert;
