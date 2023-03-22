import React from "react";
import {
  Alert
} from "reactstrap";

export default function MetaMaskAlert({ isOpen = true }) {
  
  return (
    <Alert
      className="alert-with-icon"
      color="danger"
      isOpen={isOpen}
    >
      <span data-notify="icon" className="tim-icons icon-alert-circle-exc" />
      <span><b>No MetaMask! - </b>Please, connect MetaMask</span>
    </Alert>
  );
}
