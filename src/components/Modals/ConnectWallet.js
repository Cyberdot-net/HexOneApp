import React, { useEffect } from "react";
import {
  Modal,
  Table
} from "reactstrap";

export default function ConnectWallet(props) {

  const onClose = () => {
    props.onClose();
  }

  return (
    <Modal
      modalClassName="modal-black"
      isOpen={props.isOpen}
      toggle={onClose}
      size="sm"
      style={{ top: '15vh' }}
    >
      <div className="modal-header justify-content-center">
        <button className="close" onClick={onClose}>
          <i className="tim-icons icon-simple-remove text-white" />
        </button>
        <div className="text-muted text-center ml-auto mr-auto">
          <h3 className="mb-0">Connect 
            <img
              alt="wallet-connect"
              src={require("assets/img/wallet-connect.png")}
              width="auto"
              height="28"
              className="ml-3"
            />
          </h3>
        </div>
      </div>
      <div className="modal-body">
        <Table className="tablesorter">
          <tbody className="no-overflow">
            <tr className="pointer">
              <td className="walletInfo">
                <img
                  alt="metamask"
                  src={require("assets/img/metamask.png")}
                  width="80"
                  height="auto"
                  className="mr-3"
                />
                <p className="connectWalletText">
                  Metamask<span>Browser Wallet</span>
                </p>
              </td>
              <td>
                <i className="tim-icons icon-minimal-right text-white" />
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Modal>
  );
}
