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

  const [data, setData] = useState({ hex: 0.1, totalHex: 2500 });
  const [isOpen, setOpen] = useState(false);
  const [collateralAmt, setCollateralAmt] = useState("");
  const [borrowedAmt, setBorrowedAmt] = useState("");
  const [days, setDays] = useState("");
  const [daterange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);

  useEffect(() => {
    setData({ hex: 0.1, totalHex: 2500 });

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
    setDateRange([selection]);

    // calc days in selected daterange
    const startDate = moment(selection.startDate).startOf("day");
    const endDate = moment(selection.endDate);    
    setDays(endDate.diff(startDate, 'days') + 1)
  }

  const changeCollateralAmt = (value) => {
    setCollateralAmt(value);
    setBorrowedAmt(roundNumber(value * data.hex));
  }

  const onClickBorrow = () => {
    if (!collateralAmt || !days || !borrowedAmt || collateralAmt > data.totalHex) return;

    props.onBorrow(collateralAmt, days, borrowedAmt);
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
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Borrow</h3>
        </div>
      </div>
      <div className="modal-body">
        <Form role="form">
          <FormGroup className={"mb-3 mt-3 " + (collateralAmt > data.totalHex && " has-danger")}>
            <InputGroup>
              <Input
                type="text"
                placeholder={`Collateral Amount in HEX (${(data.totalHex || 0).toLocaleString()} HEX available)`}
                value={collateralAmt}
                onChange={e => changeCollateralAmt(e.target.value)} 
                autoFocus
                {...(collateralAmt > data.totalHex) && {className: "form-control-danger"}}
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
                value={days}
                onChange={e => setDays(e.target.value)} 
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
              ranges={daterange}
              className="calendar"
            />}
          </FormGroup>
          <FormGroup className="mb-3">
            <InputGroup>
              <Input
                type="text"
                placeholder="Borrow amount"
                value={borrowedAmt}
                onChange={e => setBorrowedAmt(e.target.value)} 
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
              onClick={onClickBorrow}
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
