import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  FormGroup,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  UncontrolledTooltip,
} from "reactstrap";
import { roundNumber } from "common/utilities";

export default function Recharge(props) {
  const [amount, setAmount] = useState("");
  const [data, setData] = useState({});

  useEffect(() => {
    if (props.data && props.data.stakeid) {
      const totalHex = roundNumber(props.data.borrowedAmt * (props.data.initialHex - props.data.currentHex) / props.data.currentHex);
      setData({ ...props.data, totalHex });
    }
  }, [props.data]);

  const onClickRecharge = () => {
    if (!amount || amount > data.totalHex) return;

    props.onRecharge(data.stakeid, amount);
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
        <Form role="form">
          <FormGroup className="mb-3 mt-3">
            <InputGroup>
              <Input
                type="text"
                placeholder="StakeId"
                value={data.stakeid || ""}
                readOnly
              />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i className="tim-icons icon-bank" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup className={"mb-3 " + (amount > data.totalHex && " has-danger")}>
            <InputGroup>
              <Input
                type="text"
                placeholder={`Collateral Amount in HEX (${(data.totalHex || 0).toLocaleString()} HEX available)`}
                value={amount}
                onChange={e => setAmount(e.target.value)} 
                {...(amount > data.totalHex) && {className: "form-control-danger"}}
              />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i className="tim-icons icon-coins" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <div className="text-center">
            <Button
              className="btn-simple my-4"
              color="info"
              id="recharge"
              type="button"
              onClick={onClickRecharge}
            >
              Charge
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
