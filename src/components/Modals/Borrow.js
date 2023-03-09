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
  CustomInput,
  Alert
} from "reactstrap";
import { BigNumber, utils } from "ethers";
import { WalletContext } from "providers/WalletProvider";
import { MessageContext } from "providers/MessageProvider";
import { HexContract, HexOnePriceFeed, HexOneProtocol } from "contracts";
import { STAKEDAYS_MIN, STAKEDAYS_MAX } from "contracts/Constants";
import { formatDecimal, formatZeroDecimal, isEmpty } from "common/utilities";
import { HEX_SHARERATE_DEC } from "contracts/Constants";
import Loading from "components/Common/Loading";

export default function Borrow(props) {

  const { address, provider } = useContext(WalletContext);
  const { showMessage } = useContext(MessageContext);
  const [ isOpen, setOpen ] = useState(false);
  const [ hexDecimals, setHexDecimals ] = useState(8);
  const [ fee,  setFee ] = useState(BigNumber.from(0));
  const [ totalHex,  setTotalHex ] = useState(BigNumber.from(0));
  const [ hexFeed, setHexFeed ] = useState(BigNumber.from(0));
  const [ dayPayoutTotal, setDayPayoutTotal ] = useState(0);
  const [ shareRate, setShareRate ] = useState(BigNumber.from(0));
  const [ collateralAmt, setCollateralAmt ] = useState({ value: "", bignum: BigNumber.from(0), fee: BigNumber.from(0) });
  const [ stakeDays, setStakeDays ] = useState("");
  const [ daterange, setDateRange ] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);
  const [ commit, setCommit ] = useState(false);
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
      HexOnePriceFeed.setProvider(provider);
      HexOneProtocol.setProvider(provider);

      const getHexData = async () => {
        const decimals = await HexContract.getDecimals();
        setHexDecimals(decimals);
        setTotalHex(await HexContract.getBalance(address));
        setDayPayoutTotal(await HexContract.getDayPayoutTotal());
        setShareRate(await HexContract.getShareRate());

        setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", decimals)));

        setFee(await HexOneProtocol.getFees());

        setLoading(false);
      }

      getHexData();

  }, [ address, provider ]);

  const getBorrowAmt = () => {
    return collateralAmt['bignum'].mul(hexFeed).div(utils.parseUnits("1"));
  }

  const getTotalTshare = () => {
    return isEmpty(shareRate) ? BigNumber.from(0) : collateralAmt['fee'].mul(utils.parseUnits("1", HEX_SHARERATE_DEC)).div(shareRate);
  }

  const getEffectiveHex = () => {
    return getTotalTshare().mul(dayPayoutTotal || 0).mul(stakeDays || 0).div(utils.parseUnits("1")).add(collateralAmt['fee']);
  }

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
    const inputValue = utils.parseEther(e.target.value || "0");
    setCollateralAmt({ value: e.target.value, bignum: inputValue, fee: inputValue.mul(100 - fee).div(100) });
  }

  const onClickBorrow = async () => {
    if (isEmpty(collateralAmt['bignum']) || (+stakeDays < STAKEDAYS_MIN || STAKEDAYS_MAX < +stakeDays) || collateralAmt['bignum'].gt(totalHex)) return;

    setLoading(true);

    const amount = collateralAmt['bignum'].div(utils.parseUnits("1", 18 - hexDecimals));

    let res = await HexContract.approve(amount);
    if (res.status !== "success") {
      setLoading(false);
      showMessage(res.error ?? "Borrow failed! HEX Approve error!", "error");
      return;
    }

    res = await HexOneProtocol.depositCollateral(amount, +stakeDays, commit);
    if (res.status !== "success") {
      setLoading(false);
      showMessage(res.error ?? "Borrow failed! Deposit Collateral error!", "error");
      return;
    }

    setLoading(false);
    showMessage("Borrow success!", "info");
    setCollateralAmt({ value: "", bignum: BigNumber.from(0), fee: BigNumber.from(0) });
    props.onBorrow();
    // props.onClose();
  }

  const onClose = () => {
    setLoading(false);
    props.onClose();
  }

  return (
    <>
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
            <FormGroup className={"mb-3 mt-3 " + (collateralAmt['bignum'].gt(totalHex) && " has-danger")}>
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
                      {...(collateralAmt['bignum'].gt(totalHex)) && {className: "form-control-danger"}}
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>HEX</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Col>
              </Row>
              <Row>
                <Col sm="3"></Col>
                <Col sm="8" className="text-right">
                  <span>{formatZeroDecimal(collateralAmt['fee'])} HEX</span>
                  <span className="ml-2">(Fee: {formatZeroDecimal(collateralAmt['bignum'].sub(collateralAmt['fee']))} HEX)</span>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup className={"mb-3 " + ((stakeDays && (+stakeDays < STAKEDAYS_MIN || +stakeDays > STAKEDAYS_MAX)) && " has-danger")}>
              <Row>
                <Label sm="3" className="text-right">Stake Days</Label>
                <Col sm="8">
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder={`Stake Length in Days (${STAKEDAYS_MIN} ~ ${STAKEDAYS_MAX})`}
                      value={stakeDays}
                      onChange={e => setStakeDays(e.target.value)} 
                      {...(stakeDays && (+stakeDays < STAKEDAYS_MIN || +stakeDays > STAKEDAYS_MAX)) && {className: "form-control-danger"}}
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
                      value={formatDecimal(getEffectiveHex())}
                      readOnly
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>HEX</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup className="mb-4">
              <Row>
                <Label sm="3" className="text-right">Total T-Shares</Label>
                <Col sm="8">
                  <Input
                    type="text"
                    placeholder="Total T-Shares"
                    value={formatDecimal(getTotalTshare())}
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
                      value={formatDecimal(getBorrowAmt())}
                      readOnly
                    />
                    <InputGroupAddon addonType="append">
                      <InputGroupText>HEX1</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Col>
              </Row>
            </FormGroup>
            <FormGroup className="mb-3">
              <Row>
                <Col sm="3"></Col>
                <Col sm="8">
                  <CustomInput type="switch" id="switch" label="Committed" checked={commit} onChange={e => setCommit(e.target.checked)} />
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
      {loading && <Loading />}
    </>
  );
}
