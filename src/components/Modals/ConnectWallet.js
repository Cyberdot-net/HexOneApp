import React, { useContext } from "react";
import {
  Modal,
  Table,
  Alert
} from "reactstrap";
import { ethers } from "ethers";
import { useState } from "react";
import { WalletContext } from "providers/WalletProvider";
import { ModalContext } from "providers/ModalProvider";

export default function ConnectWallet() {
  
  const { setProvider, address } = useContext(WalletContext);
  const { open, showModal } = useContext(ModalContext);
  const [ message, setMessage ] = useState({ show: false, error: "", msg: "" });
  const [ connecting, setConnecting ] = useState(false);

  const connectMetaMask = async () => {

    if (address) return;

    if (typeof window.ethereum === 'undefined') {
      setMessage({ show: true, error: "<b>No MetaMask! - </b>Please, install MetaMask", msg: "" });
      return;
    }

    setConnecting(true);

    // Connect to MetaMask
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
      setConnecting(false);
      setMessage({ show: true, error: "Failed to connect to MetaMask", msg: "" });
      return;
    }

    // Set up the provider and wallet
    const connectProvider = new ethers.providers.Web3Provider(window.ethereum);

    const network = await connectProvider.getNetwork();

    console.log(network);

    setProvider(connectProvider);

    setMessage({ show: true, msg: "<b>Success! - </b>Connected MetaMask", error: "" });

    setConnecting(false);
    onClose();

  }

  const onClose = () => {
    showModal(false);
  }

  return (
    <Modal
      modalClassName="modal-black"
      isOpen={open}
      toggle={onClose}
      size="md"
      style={{ top: '15vh' }}
      unmountOnClose
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
        <Alert
          className="alert-with-icon"
          color={message.msg ? "success" : "danger"}
          isOpen={message.show}
          toggle={() => setMessage({ show: false, error: "", msg: "" })}
        >
          <span data-notify="icon" className={`tim-icons ${message.msg ? "icon-check-2" : "icon-alert-circle-exc"}`} />
          <span dangerouslySetInnerHTML={{__html: message.msg ? message.msg : message.error }}></span>
        </Alert>
        <Table className="tablehover">
          <tbody className="no-overflow">
            {connecting ? <tr className="cursor-pointer">
              <td>
                <div className="walletInfo">
                  <img
                    alt="loading"
                    src={require("assets/img/loading.gif")}
                    width="70"
                    height="auto"
                    className="mr-3"
                  />
                  <p className="connectWalletText">
                    Waiting to connect<span>Confirm this connection in your wallet</span>
                  </p>
                </div>
              </td>
            </tr> : <tr className={address ? "cursor-none" : "cursor-pointer"} onClick={connectMetaMask}>
              <td>
                <div className="walletInfo">
                  <img
                    alt="metamask"
                    src={require("assets/img/metamask.png")}
                    width="70"
                    height="auto"
                    className="mr-3"
                  />
                  <p className="connectWalletText">
                    Metamask<span>Browser Wallet</span>
                  </p>
                </div>
              </td>
              <td>
                <i className="tim-icons icon-minimal-right text-white" />
              </td>
            </tr>}
          </tbody>
        </Table>
      </div>
    </Modal>
  );
}
