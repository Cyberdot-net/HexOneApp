import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import moment from "moment";
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

export default function Borrow(props) {

  const [wallet, setWallet] = useState({
    totalHex: "",
    collateral: "",
    hex_usdc_feed: "",
    borrow_amount: "",
    days: ""
  });
  const [isOpen, setOpen] = useState(false);
  const [days, setDays] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);

  useEffect(() => {
    setWallet({
      totalHex: 2500,
      collateral: "",
      hex_usdc_feed: 0.1,
      borrow_amount: "",
      days: ""
    });

    document.addEventListener("mousedown", bodyMouseDowntHandler);
    return () => {
      document.removeEventListener("mousedown", bodyMouseDowntHandler);
    };
  }, []);

  const bodyMouseDowntHandler = e => {
    const calendar = document.getElementsByClassName("calendar");
    if (calendar?.length && !calendar[0].contains(e.target)) {
      setOpen(false);
    }
  }

  const selectDays = (ranges) => {
    let { selection } = ranges;
    selection.startDate = moment(new Date()).startOf("day").toDate();
    setDays([selection]);
    setWallet(prevWallet => {
      const startDate = moment(selection.startDate).startOf("day");
      const endDate = moment(selection.endDate);
      return { ...prevWallet, days: endDate.diff(startDate, 'days') + 1 };
    });
  }

  const changeWallet = (key, value) => {
    setWallet(prevWallet => {
      if (key === 'collateral') {
        return { ...prevWallet, [key]: value, borrow_amount: roundNumber(value * prevWallet.hex_usdc_feed)};
      } else {
        return { ...prevWallet, [key]: value };
      }
    });
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
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Borrow</h3>
        </div>
      </div>
      <div className="modal-body">
        <Form role="form">
          <FormGroup className={"mb-3 mt-3 " + (wallet.totalHex < wallet.collateral && " has-danger")}>
            <InputGroup>
              <Input
                type="text"
                placeholder={`Collateral Amount in HEX (${(wallet.totalHex || 0).toLocaleString()} HEX available)`}
                value={wallet.collateral}
                onChange={e => changeWallet('collateral', e.target.value)} 
                {...(wallet.totalHex < wallet.collateral) && {className: "form-control-danger"}}
              />
              <InputGroupAddon addonType="append">
                <InputGroupText>
                  <i className="tim-icons icon-coins" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </FormGroup>
          <FormGroup className="mb-3">
            <InputGroup>
              <Input
                type="text"
                placeholder="Stake Length in Days"
                value={wallet.days}
                onChange={e => changeWallet('days', e.target.value)} 
              />
              <InputGroupAddon addonType="append" className="pointer" onClick={e => setOpen(!isOpen)}>
                <InputGroupText>
                  <i className="tim-icons icon-calendar-60" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            {isOpen && <DateRange
              editableDateInputs={true}
              minDate={new Date()}
              onChange={selectDays}
              moveRangeOnFirstSelection={false}
              showPreview={false}
              ranges={days}
              className="calendar"
            />}
          </FormGroup>
          <FormGroup className="mb-3">
            <InputGroup>
              <Input
                type="text"
                placeholder="Borrow amount"
                value={wallet.borrow_amount}
                onChange={e => changeWallet('borrow_amount', e.target.value)} 
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
              id="borrow"
              type="button"
            >
              Borrow
            </Button>
            <UncontrolledTooltip
              placement="bottom"
              target="borrow"
            >
              Borrow HEX1 by depositing HEX (T-shares)
            </UncontrolledTooltip>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
