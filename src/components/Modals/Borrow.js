import React, { useState, useEffect, useContext } from "react";
import { DateRange } from "react-date-range";
import moment from "moment";
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
import { Contract, BigNumber } from "ethers";
import { roundNumber  } from "common/utilities";
import { WalletContext } from "providers/WalletProvider";
import { HEX_ADDRESS, ERC20_ABI } from "services/Contract";

export default function Borrow(props) {

  const { address, provider } = useContext(WalletContext);
  const [ totalHex,  setTotalHex ] = useState(0);
  const [ hexFeed, setHexFeed ] = useState(0);
  const [ shareRate, setShareRate ] = useState(0);
  const [ dayPayoutTotal, setDayPayoutTotal ] = useState(0);
  const [ isOpen, setOpen ] = useState(false);
  const [ collateralAmt, setCollateralAmt ] = useState("");
  const [ borrowedAmt, setBorrowedAmt ] = useState("");
  const [ effectiveHex, setEffectiveHex ] = useState("");
  const [ totalTShare, setTotalTShare ] = useState("");
  const [ stakeDays, setStakeDays ] = useState("");
  const [ daterange, setDateRange ] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);

  useEffect(() => {

    console.log(HEX_ADDRESS);

    const getData = async () => {
      const contract = new Contract(HEX_ADDRESS, ERC20_ABI, provider);
      let maxValue = 0;

      try {

        const sampleNum = BigNumber.from("0x156342a");
        maxValue = await contract.approve(address, sampleNum);

      } catch (e) {
        alert(e);
        maxValue = 10000;
      }

      // const maxValue = await contract.maxSupply();
  
      setTotalHex(maxValue);

      setHexFeed(0.1);
  
      setShareRate(265452); // get from third value (function 12)
  
      setDayPayoutTotal(6494422766799027); // get from when use 8 (function 9)
    }

    getData();

    const bodyMouseDowntHandler = e => {
      const calendar = document.getElementsByClassName("calendar");
      if (calendar?.length && !calendar[0].contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", bodyMouseDowntHandler);
    return () => {
      document.removeEventListener("mousedown", bodyMouseDowntHandler);
    };
  }, []);

  useEffect(() => {
    const totalTShare = totalHex / shareRate;

    setTotalTShare(isNaN(totalTShare) ? "" : totalTShare);

    const effectiveHex = totalTShare * dayPayoutTotal * stakeDays;

    setEffectiveHex(isNaN(effectiveHex) ? "" : effectiveHex);

  }, [ totalHex, shareRate, dayPayoutTotal, stakeDays ]);

  const selectStakeDays = (ranges) => {
    let { selection } = ranges;
    selection.startDate = moment(new Date()).startOf("day").toDate();
    setDateRange([selection]);

    // calc days in selected daterange
    const startDate = moment(selection.startDate).startOf("day");
    const endDate = moment(selection.endDate);    
    setStakeDays(endDate.diff(startDate, 'days') + 1)
  }

  const changeCollateralAmt = (value) => {
    setCollateralAmt(value);
    setBorrowedAmt(roundNumber(value * hexFeed));
  }

  const onClickBorrow = () => {
    if (!collateralAmt || !stakeDays || !borrowedAmt || collateralAmt > totalHex) return;

    props.onBorrow(collateralAmt, stakeDays, borrowedAmt);
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
        <Alert
          className="alert-with-icon"
          color="danger"
          isOpen={!address}
        >
          <span data-notify="icon" className="tim-icons icon-alert-circle-exc" />
          <span><b>No MetaMask! - </b>Please, connect MetaMask</span>
        </Alert>
        <Form role="form">
          <FormGroup className={"mb-3 mt-3 " + (collateralAmt > totalHex && " has-danger")}>
            <Row>
              <Label sm="3" className="text-right">Collateral Amount</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder={`Collateral Amount in HEX (${(totalHex || 0).toLocaleString()} HEX available)`}
                    value={collateralAmt}
                    onChange={e => changeCollateralAmt(e.target.value)} 
                    autoFocus
                    {...(collateralAmt > totalHex) && {className: "form-control-danger"}}
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
              <Label sm="3" className="text-right">Stake Days</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Stake Length in Days"
                    value={stakeDays}
                    onChange={e => setStakeDays(e.target.value)} 
                  />
                  <InputGroupAddon addonType="append" className="cursor-pointer" onClick={e => setOpen(!isOpen)}>
                    <InputGroupText>
                      <i className="tim-icons icon-calendar-60" />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {isOpen && <DateRange
                  editableDateInputs={true}
                  minDate={new Date()}
                  onChange={selectStakeDays}
                  moveRangeOnFirstSelection={false}
                  showPreview={false}
                  ranges={daterange}
                  className="calendar"
                />}
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
                    value={effectiveHex}
                    onChange={e => setEffectiveHex(e.target.value)} 
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
                  value={totalTShare}
                  onChange={e => setTotalTShare(e.target.value)} 
                />
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-3">
            <Row>
              <Label sm="3" className="text-right">Borrow amount</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Borrow amount"
                    value={borrowedAmt}
                    onChange={e => setBorrowedAmt(e.target.value)} 
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
              id="borrow"
              type="button"
              disabled={!address}
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
