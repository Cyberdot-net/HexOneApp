import React, { useState, useEffect, useContext } from "react";
import {
  Modal,
  Button,
  Row,
  Col,
  Label,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  UncontrolledTooltip,
  Alert
} from "reactstrap";
import { BigNumber, utils } from "ethers";
import { WalletContext, MessageContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexOneProtocol } from "contracts";
import { formatDecimal, isEmpty } from "common/utilities";

export default function Reborrow({ show, data, onClose, onReborrow }) {

  const { address, provider } = useContext(WalletContext);
  const { showMessage } = useContext(MessageContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ amount, setAmount ] = useState({ value: "", bignum: BigNumber.from(0) });
  const [ totalHex,  setTotalHex ] = useState(0);

  useEffect(() => {
    if (!address) return;

    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);

    // if (data && data.depositId) {
    //   setTotalHex(data.mintAmount.mul(data.currentFeed).div(utils.parseUnits("1")));
    // }

    const getHexData = async () => {
      showLoading();
      setTotalHex(await HexOneVault.getBorrowableAmount(address, data.depositId));
      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [ address, provider, data ]);

  const changeAmount = (e) => {
    const inputValue = utils.parseEther(e.target.value || "0");
    setAmount({ value: e.target.value, bignum: inputValue });
  }

  const onClickReborrow = async () => {
    if (isEmpty(amount['bignum']) || amount['bignum'].gt(totalHex)) return;

    showLoading("Re-borrowing...");

    let res = await HexOneProtocol.borrowHexOne(data.depositId, amount["bignum"]);
    if (res.status !== "success") {
      hideLoading();
      showMessage(res.error ?? "Re-Borrow failed! Borrow Hex One error!", "error");
      return;
    }

    setAmount({ value: "", bignum: BigNumber.from(0) });

    onReborrow();
    setTotalHex(await HexOneVault.getBorrowableAmount(address, data.depositId));

    hideLoading();
    showMessage("Re-Borrow success!", "info");
  }

  return (
    <Modal
      modalClassName="modal-black"
      isOpen={show}
      toggle={onClose}
      size="lg"
    >
      <div className="modal-header justify-content-center">
        <button className="close" onClick={onClose}>
          <i className="tim-icons icon-simple-remove text-white" />
        </button>
        <div className="text-muted text-center ml-auto mr-auto">
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Re-Borrow</h3>
        </div>
      </div>
      <div className="modal-body">
        <Alert
          className="alert-with-icon"
          color="danger"
          isOpen={!address}
        >
          <span data-notify="icon" className="tim-icons icon-alert-circle-exc" />
          <span><b>No MetaMask! - </b>Please, connect MetaMask</span>
        </Alert>
        <Form role="form">
          <FormGroup className="mb-3 mt-3">
            <Row>
              <Label sm="3" className="text-right">StakeId</Label>
              <Col sm="8">
                <Input
                  type="text"
                  placeholder="StakeId"
                  value={data.depositId.toString()}
                  readOnly
                />
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className={"mb-3 " + (amount['bignum'].gt(totalHex) && " has-danger")}>
            <Row>
              <Label sm="3" className="text-right">Borrow Amount</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder={`Borrow Amount in HEX (${formatDecimal(totalHex) || 0} HEX available)`}
                    value={amount.value}
                    onChange={changeAmount} 
                    autoFocus
                    {...(amount['bignum'].gt(totalHex)) && {className: "form-control-danger"}}
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>HEX1</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </Row>
          </FormGroup>
          <div className="text-center">
            <Button
              className="btn-simple my-4"
              color="info"
              id="reborrow"
              type="button"
              disabled={!address}
              onClick={onClickReborrow}
            >
              Borrow
            </Button>
            <UncontrolledTooltip
              placement="bottom"
              target="reborrow"
            >
              Mint more $HEX1 without adding any collateral
            </UncontrolledTooltip>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
