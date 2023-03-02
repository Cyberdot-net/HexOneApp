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

export default function Reborrow(props) {
  const [amount, setAmount] = useState("");
  const [data, setData] = useState({});
  const [totalHex, setTotalHex] = useState(0);

  useEffect(() => {
    if (props.data && props.data.stakeid) {
      const totalHex = props.data.borrowedAmt * (props.data.currentHex - props.data.initialHex);
      setData({ ...props.data });
      setTotalHex(totalHex);
    }
  }, [props.data]);

  const onClickReborrow = () => {
    if (!amount || amount > totalHex) return;

    props.onReborrow(data.stakeid, amount);
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
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Re-Borrow</h3>
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
          <FormGroup className={"mb-3 " + (amount > totalHex && " has-danger")}>
            <InputGroup>
              <Input
                type="text"
                placeholder={`Borrow Amount in HEX (${(totalHex || 0).toLocaleString()} HEX available)`}
                value={amount}
                onChange={e => setAmount(e.target.value)} 
                {...(amount > totalHex) && {className: "form-control-danger"}}
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
              id="reborrow"
              type="button"
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
