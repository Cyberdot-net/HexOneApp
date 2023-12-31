import moment from "moment";
import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import { DateRange } from "react-date-range";
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
} from "reactstrap";
import { BigNumber, utils } from "ethers";
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexContract, HexOnePriceFeed, HexOneProtocol } from "contracts";
import { HexOneToken_Addr } from "contracts/address";
import { HEX_SHARERATE_DEC } from "contracts/Constants";
import { formatDecimal, formatZeroDecimal, formatFloat, isEmpty } from "common/utilities";


export default function Borrow({ show, onClose, onBorrow }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [isOpen, setOpen] = useState(false);
  const [hexDecimals, setHexDecimals] = useState(8);
  const [fee, setFee] = useState(0);
  const [totalHex, setTotalHex] = useState(0);
  const [hexFeed, setHexFeed] = useState(0);
  const [dayPayoutTotal, setDayPayoutTotal] = useState(0);
  const [shareRate, setShareRate] = useState(0);
  const [collateralAmt, setCollateralAmt] = useState({ value: "", bignum: BigNumber.from(0), fee: BigNumber.from(0) });
  const [stakeDays, setStakeDays] = useState("");
  const [daterange, setDateRange] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);
  const [result, showResult] = useState(false);
  const [STAKEDAYS_MIN, setMinDuration] = useState(0);
  const [STAKEDAYS_MAX, setMaxDuration] = useState(0);

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
    if (!address || !provider) return;

    showLoading();

    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);
    HexOneProtocol.setProvider(provider);

    const getHexData = async () => {
      const decimals = await HexContract.getDecimals();
      setHexDecimals(decimals);
      setTotalHex(await HexContract.getBalance(address));
      setDayPayoutTotal(await HexContract.getDayPayoutTotal());
      setShareRate(await HexContract.getShareRate());
      setMinDuration(await HexOneProtocol.getMinDuration());
      setMaxDuration(await HexOneProtocol.getMaxDuration());

      setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", decimals)));

      setFee(await HexOneProtocol.getFees());

      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [address, provider]);

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
    if (isEmpty(collateralAmt['bignum']) || collateralAmt['bignum'].gt(totalHex) || (+stakeDays < STAKEDAYS_MIN || STAKEDAYS_MAX < +stakeDays)) return;

    showLoading("Borrowing...");

    let res = null;

    const amount = collateralAmt['bignum'].div(utils.parseUnits("1", 18 - hexDecimals));

    const allowanceAmount = await HexContract.allowance(address);
    if (allowanceAmount.lt(amount)) {
      res = await HexContract.approve(amount);
      if (res.status !== "success") {
        hideLoading();
        toast.error(res.error ?? "Borrow failed! HEX Approve error!");
        return;
      }
    }

    res = await HexOneProtocol.depositCollateral(amount, +stakeDays);
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Borrow failed! Deposit Collateral error!");
      return;
    }

    setCollateralAmt({ value: "", bignum: BigNumber.from(0), fee: BigNumber.from(0) });
    setStakeDays("");

    onBorrow();
    setTotalHex(await HexContract.getBalance(address));

    hideLoading();
    showResult(true);
    // onClose();
  }

  const onClickAddHexOneToken = async () => {
    if (!address || !provider) return;

    if (typeof window.ethereum === 'undefined') {
      toast.error("<b>No MetaMask! - </b>Please, install MetaMask");
      return;
    }

    showLoading("Adding...");

    // Add Hexone to MetaMask
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: HexOneToken_Addr.contract,
            symbol: "HEXONE",
            decimals: 18,
          },
        },
      });

      hideLoading();
      if (wasAdded) {
        toast.success("Added hexone to MetaMask");
      } else {
        toast.error("Failed to add hexone to MetaMask");
      }

    } catch (error) {
      hideLoading();

      if (error.code === 4001) {
        toast.error(`Add failed! ${error.message}`);
      } else {
        toast.error(`Add failed! ${error.message}`);
      }

      return;
    }
  }

  return (
    <>
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
            <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Borrow</h3>
          </div>
        </div>
        <div className="modal-body">
          <MetaMaskAlert isOpen={!address} />
          <Form role="form">
            <FormGroup className={"mb-3 mt-3 " + (collateralAmt['bignum'].gt(totalHex) && " has-danger")}>
              <Row>
                <Label sm="3" className="text-right">Collateral Amount</Label>
                <Col sm="8">
                  <InputGroup>
                    <Input
                      type="text"
                      placeholder={`Collateral Amount in HEX (${formatZeroDecimal(totalHex)} HEX available)`}
                      value={collateralAmt.value}
                      onChange={changeCollateralAmt}
                      autoFocus
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
                      placeholder={`Stake Length in Days (${formatFloat(STAKEDAYS_MIN)} ~ ${formatFloat(STAKEDAYS_MAX)})`}
                      value={stakeDays}
                      onChange={e => setStakeDays(e.target.value)}
                    />
                    <InputGroupAddon addonType="append" className="cursor-pointer" onClick={() => setOpen(!isOpen)}>
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
      <Modal
        isOpen={result}
        toggle={() => showResult(false)}
        backdrop="static"
      >
        <div className="modal-header justify-content-center">
          <button className="close" onClick={() => showResult(false)} style={{ padding: "10px", top: "10px", right: "16px" }}>
            <i className="tim-icons icon-simple-remove" />
          </button>
          <h4 className="title title-up">Borrow success!</h4>
        </div>
        <div className="modal-footer" style={{ justifyContent: "flex-end" }}>
          <Button
            className="mr-2"
            color="success"
            type="button"
            size="sm"
            onClick={() => onClickAddHexOneToken()}
          >
            Add Hexone
          </Button>
          <Button
            color="default"
            type="button"
            size="sm"
            onClick={() => showResult(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
