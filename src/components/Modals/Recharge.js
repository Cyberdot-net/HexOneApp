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
import { WalletContext, MessageContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexOneProtocol, HexContract } from "contracts";
import { HEX_SHARERATE_DEC } from "contracts/Constants";
import { formatDecimal, isEmpty } from "common/utilities";

export default function Recharge({ show, data, onClose, onRecharge }) {

  const { address, provider } = useContext(WalletContext);
  const { showMessage } = useContext(MessageContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ fee,  setFee ] = useState(0);
  const [ shareRate, setShareRate ] = useState(0);
  const [ dayPayoutTotal, setDayPayoutTotal ] = useState(0);
  const [ collateralAmt, setCollateralAmt ] = useState({ value: "", bignum: BigNumber.from(0), fee: BigNumber.from(0) });
  const [ totalHex, setTotalHex ] = useState(0);

  useEffect(() => {
    if (!address) return;

    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);
    HexContract.setProvider(provider);

    const getHexData = async () => {
      showLoading();
      setTotalHex(await HexOneVault.getLiquidableDeposit(data.depositId));
      setShareRate(await HexContract.getShareRate());
      setDayPayoutTotal(await HexContract.getDayPayoutTotal());

      setFee(await HexOneProtocol.getFees());
      hideLoading();
    }

    //const totalHex = data.borrowedAmt * (data.initialHex - data.currentHex) / data.currentHex;

    getHexData();

  }, [ provider, address, data ]);

  const changeCollateralAmt = (e) => {
    const inputValue = utils.parseEther(e.target.value || "0");
    setCollateralAmt({ value: e.target.value, bignum: inputValue, fee: inputValue.mul(100 - fee).div(100) });
  }

  const getTotalTshare = () => {
    return isEmpty(shareRate) ? BigNumber.from(0) : collateralAmt['bignum'].mul(utils.parseUnits("1", HEX_SHARERATE_DEC)).div(shareRate);
  }
  
  const getEffectiveHex = () => {
    return getTotalTshare().mul(dayPayoutTotal || 0).mul(data.endHexDay.sub(data.lockedHexDay)).div(utils.parseUnits("1")).add(collateralAmt['bignum']);
  }
  
  const onClickRecharge = async () => {
    if (isEmpty(collateralAmt['bignum']) || collateralAmt['bignum'].gt(totalHex)) return;

    showLoading("Re-Charging...");

    // let res = await HexOneProtocol.borrowHexOne(data.depositId, collateralAmt.div(utils.parseUnits("1", 18 - hexDecimals)));
    // if (res.status !== "success") {
    //   hideLoading();
    //   showMessage(res.error ?? "Re-Charge failed! Charge Hex One error!", "error");
    //   return;
    // }

    setCollateralAmt({ value: "", bignum: BigNumber.from(0), fee: BigNumber.from(0) });

    onRecharge();
    setTotalHex(await HexOneVault.getLiquidableDeposit(data.depositId));

    hideLoading();
    showMessage("Re-Charge success!", "info");
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
