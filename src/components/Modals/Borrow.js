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
import { BigNumber, utils } from "ethers";
import { WalletContext } from "providers/WalletProvider";
import { HexContract, PriceFeedContract, HexOneVaultContract } from "contracts/index";
import { formatDecimal, isEmpty } from "common/utilities";
import Loading from "components/Loading";

export default function Borrow(props) {

  const { address, provider } = useContext(WalletContext);
  const [ totalHex,  setTotalHex ] = useState(0);
  const [ hexFeed, setHexFeed ] = useState(BigNumber.from(0));
  const [ dayPayoutTotal, setDayPayoutTotal ] = useState(0);
  const [ isOpen, setOpen ] = useState(false);
  const [ collateralAmt, setCollateralAmt ] = useState({ value: "", decimal: utils.parseEther("0") });
  const [ borrowedAmt, setBorrowedAmt ] = useState(BigNumber.from(0));
  const [ effectiveHex, setEffectiveHex ] = useState(BigNumber.from(0));
  const [ totalTShare, setTotalTShare ] = useState(BigNumber.from(0));
  const [ shareRate, setShareRate ] = useState(BigNumber.from(0));
  const [ stakeDays, setStakeDays ] = useState("");
  const [ daterange, setDateRange ] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);
  const [ loading, setLoading ] = useState(false);

  useEffect(() => {
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
      if (!address) return;

      setLoading(true);

      HexContract.setProvider(provider);
      PriceFeedContract.setProvider(provider);
      HexOneVaultContract.setProvider(provider);

      const getHexData = async () => {
        setTotalHex(await HexContract.getBalance(address));
        setDayPayoutTotal(await HexContract.getDayPayoutTotal());
        setShareRate(await HexContract.getShareRate());

        setHexFeed(await PriceFeedContract.getPriceFeed());

        setLoading(false);
      }

      getHexData();

  }, [ address, provider ]);

  useEffect(() => {
    setEffectiveHex(totalTShare.mul(dayPayoutTotal || 0).mul(stakeDays || 0).div(utils.parseUnits("1")));
  }, [ totalTShare, dayPayoutTotal, stakeDays ]);

  useEffect(() => {
    if (isEmpty(hexFeed)) return;
    setBorrowedAmt(collateralAmt['decimal'].mul(hexFeed).div(utils.parseUnits("1")));
    setTotalTShare(isEmpty(shareRate) ? BigNumber.from(0) : collateralAmt['decimal'].div(shareRate));
  }, [ collateralAmt, hexFeed ]);

  const selectStakeDays = (ranges) => {
    let { selection } = ranges;
    selection.startDate = moment(new Date()).startOf("day").toDate();
    setDateRange([selection]);

    // calc days in selected daterange
    const startDate = moment(selection.startDate).startOf("day");
    const endDate = moment(selection.endDate);    
    setStakeDays(endDate.diff(startDate, 'days') + 1)
  }

  const changeCollateralAmt = (e) => {
    setCollateralAmt({ value: e.target.value, decimal: utils.parseEther(e.target.value || "0") });
  }

  const onClickBorrow = () => {
    if (isEmpty(collateralAmt['decimal']) || !stakeDays || isEmpty(borrowedAmt) || collateralAmt['decimal'].gt(totalHex)) return;

    props.onBorrow(collateralAmt['decimal'], stakeDays, borrowedAmt);
    props.onClose();
  }

  const onClose = () => {
    setLoading(false);
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
          <FormGroup className={"mb-3 mt-3 " + (collateralAmt['decimal'].gt(totalHex) && " has-danger")}>
            <Row>
              <Label sm="3" className="text-right">Collateral Amount</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder={`Collateral Amount in HEX (${formatDecimal(totalHex) || 0} HEX available)`}
                    value={collateralAmt.value}
                    onChange={changeCollateralAmt} 
                    autoFocus
                    {...(collateralAmt['decimal'].gt(totalHex)) && {className: "form-control-danger"}}
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
                    value={formatDecimal(effectiveHex)}
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
                  value={formatDecimal(totalTShare)}
                  readOnly
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
                    value={formatDecimal(borrowedAmt)}
                    readOnly
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
      {loading && <Loading />}
    </Modal>
  );
}
