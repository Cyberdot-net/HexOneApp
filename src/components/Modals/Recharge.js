import moment from "moment";
import React, { useState, useEffect, useContext} from "react";
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
  Alert
} from "reactstrap";
import { BigNumber, utils } from "ethers";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexOneProtocol, HexContract } from "contracts";
import { HEX_SHARERATE_DEC, STAKEDAYS_MIN, STAKEDAYS_MAX } from "contracts/Constants";
import { formatDecimal, formatterFloat, isEmpty } from "common/utilities";

export default function Recharge({ show, data, onClose, onRecharge }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ hexDecimals, setHexDecimals ] = useState(8);
  const [ isOpen, setOpen ] = useState(false);
  const [ shareRate, setShareRate ] = useState(0);
  const [ dayPayoutTotal, setDayPayoutTotal ] = useState(0);
  const [ collateralAmt, setCollateralAmt ] = useState({ value: "", bignum: BigNumber.from(0) });
  const [ totalHex, setTotalHex ] = useState(0);
  const [ stakeDays, setStakeDays ] = useState("");
  const [ daterange, setDateRange ] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);

  useEffect(() => {
    if (!address) return;

    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);
    HexContract.setProvider(provider);

    const getHexData = async () => {
      showLoading();

      setHexDecimals(await HexContract.getDecimals());
      setTotalHex(await HexOneVault.getLiquidableTotalHex(data.depositId));
      setShareRate(await HexContract.getShareRate());
      setDayPayoutTotal(await HexContract.getDayPayoutTotal());

      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [ provider, address, data ]);

  const changeCollateralAmt = (e) => {
    setCollateralAmt({ value: e.target.value, bignum: utils.parseEther(e.target.value || "0") });
  }

  const getTotalTshare = () => {
    return isEmpty(shareRate) ? BigNumber.from(0) : collateralAmt['bignum'].mul(utils.parseUnits("1", HEX_SHARERATE_DEC)).div(shareRate);
  }
  
  const getEffectiveHex = () => {
    return getTotalTshare().mul(dayPayoutTotal || 0).mul(stakeDays || 0).div(utils.parseUnits("1")).add(collateralAmt['bignum']);
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

  const onClickRecharge = async () => {
    if (isEmpty(collateralAmt['bignum']) || collateralAmt['bignum'].gt(totalHex) || (+stakeDays < STAKEDAYS_MIN || STAKEDAYS_MAX < +stakeDays)) return;

    showLoading("Re-Charging...");

    let res = null;

    const amount = collateralAmt['bignum'].div(utils.parseUnits("1", 18 - hexDecimals));

    const allowanceAmount = await HexContract.allowance(address);
    if (allowanceAmount.lt(amount)) {
      res = await HexContract.approve(amount);
      if (res.status !== "success") {
        hideLoading();
        toast.error("Re-Charge failed! HEX Approve error!");
        return;
      }
    }

    res = await HexOneProtocol.addCollateralForLiquidate(amount, data.depositId, +stakeDays);
    if (res.status !== "success") {
      hideLoading();
      toast.error("Re-Charge failed! Charge Hex One error!");
      return;
    }

    setCollateralAmt({ value: "", bignum: BigNumber.from(0) });
    setStakeDays("");

    onRecharge();
    setTotalHex(await HexOneVault.getLiquidableTotalHex(data.depositId));

    hideLoading();
    toast.success("Re-Charge success!");
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
          <FormGroup className={"mb-3 " + (collateralAmt['bignum'].gt(totalHex) && " has-danger")}>
            <Row>
              <Label sm="3" className="text-right">Collateral Amount</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder={`Collateral Amount in HEX (${formatDecimal(totalHex) || 0} HEX available)`}
                    value={collateralAmt['value']}
                    onChange={changeCollateralAmt} 
                    {...(collateralAmt['bignum'].gt(totalHex)) && {className: "form-control-danger"}}
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>HEX</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
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
                    placeholder={`Stake Length in Days (${formatterFloat(STAKEDAYS_MIN)} ~ ${formatterFloat(STAKEDAYS_MAX)})`}
                    value={stakeDays}
                    onChange={e => setStakeDays(e.target.value)} 
                    {...(stakeDays && (+stakeDays < STAKEDAYS_MIN || +stakeDays > STAKEDAYS_MAX)) && {className: "form-control-danger"}}
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
          <FormGroup className="mb-3 mt-3">
            <Row>
              <Label sm="3" className="text-right">StakeId</Label>
              <Col sm="8">
                <Input
                  type="text"
                  placeholder="StakeId"
                  value={data.depositId}
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
          <FormGroup className="mb-3">
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
