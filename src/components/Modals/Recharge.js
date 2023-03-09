import React, { useState, useEffect, useContext} from "react";
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
import { WalletContext } from "providers/WalletProvider";

export default function Recharge(props) {

  const { address } = useContext(WalletContext);
  const [ shareRate, setShareRate ] = useState(0);
  const [ dayPayoutTotal, setDayPayoutTotal ] = useState(0);
  const [ collateralAmt, setCollateralAmt ] = useState({ value: "", decimal: BigNumber.from(0), fee: BigNumber.from(0) });
  const [ data, setData ] = useState({});
  const [ totalHex, setTotalHex ] = useState(0);
  const BORROW_FEE = 5;

  useEffect(() => {
    setShareRate(265452); // get from third value (function 12)
    setDayPayoutTotal(6494422766799027); // get from when use 8 (function 9)
  }, []);

  useEffect(() => {
    if (props.data && props.data.stakeid) {
      const totalHex = props.data.borrowedAmt * (props.data.initialHex - props.data.currentHex) / props.data.currentHex;
      setData({ ...props.data });
      setTotalHex(totalHex);
    }
  }, [props.data]);
  
  const getTotalTshare = () => {
    return (data.totalHex / shareRate) || "";
  }

  const getEffectiveHex = () => {
    return (getTotalTshare() * dayPayoutTotal * (data.endDay - data.startDay)) || "";
  }

  const changeCollateralAmt = (e) => {
    const inputValue = utils.parseEther(e.target.value || "0");
    setCollateralAmt({ value: e.target.value, decimal: inputValue, fee: inputValue.mul(100 - BORROW_FEE).div(100) });
  }
  
  const onClickRecharge = () => {
    // if (!amount || amount > totalHex) return;

    // props.onRecharge(data.stakeid, amount);
    props.onClose();
  }

  const onClose = () => {
    props.onClose();
  }

  return (
    <Modal
      modalClassName="modal-black"
      isOpen={props.isOpen}
      toggle={onClose}
      size="lg"
    >
      <div className="modal-header justify-content-center">
        <button className="close" onClick={onClose}>
          <i className="tim-icons icon-simple-remove text-white" />
        </button>
        <div className="text-muted text-center ml-auto mr-auto">
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Re-Charge</h3>
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
                  value={data.stakeid || ""}
                  readOnly
                />
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-3">
            <Row>
              <Label sm="3" className="text-right">Effective Hex</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Effective Hex"
                    value={getEffectiveHex()}
                    readOnly
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>HEX</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-3">
            <Row>
              <Label sm="3" className="text-right">Total T-Shares</Label>
              <Col sm="8">
                <Input
                  type="text"
                  placeholder="Total T-Shares"
                  value={getTotalTshare()}
                  readOnly
                />
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className={"mb-3 " + (collateralAmt['value'] > totalHex && " has-danger")}>
            <Row>
              <Label sm="3" className="text-right">Collateral Amount</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder={`Collateral Amount in HEX (${(totalHex || 0).toLocaleString()} HEX available)`}
                    value={collateralAmt['value']}
                    onChange={changeCollateralAmt} 
                    {...(collateralAmt['value'] > totalHex) && {className: "form-control-danger"}}
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>HEX</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </Row>
          </FormGroup>
          <div className="text-center">
            <Button
              className="btn-simple my-4"
              color="info"
              id="recharge"
              type="button"
              disabled={!address}
              onClick={onClickRecharge}
            >
              Add Collateral
            </Button>
            <UncontrolledTooltip
              placement="bottom"
              target="recharge"
            >
              Add more collateral (HEX) without borrowing more $HEX1
            </UncontrolledTooltip>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
