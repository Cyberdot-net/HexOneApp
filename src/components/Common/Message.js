import React, { useContext } from "react";
import {
  Modal,
  Button
} from "reactstrap";
import { MessageContext } from "providers/Contexts";

const customStyles = {
  closeButton: {
    top: "10px",
    padding: "10px",
    right: "16px"
  },
  footer: {
    justifyContent: "flex-end",
    padding: "12px 12px 8px 12px"
  }
}

export default function Message() {

  const { msg, hideMessage } = useContext(MessageContext);

  return (
    <Modal
      isOpen={msg ? true : false}
      toggle={() => hideMessage()}
    >
      <div className="modal-header justify-content-center">
        <button className="close" onClick={() => hideMessage()} style={customStyles.closeButton}>
          <i className="tim-icons icon-simple-remove" />
        </button>
        <h4 className="title title-up">{msg}</h4>
      </div>
      <div className="modal-footer" style={customStyles.footer}>
        <Button
          color="default"
          type="button"
          size="sm"
          onClick={() => hideMessage()}
        >
          Close
        </Button>
      </div>
    </Modal>
  );
}
