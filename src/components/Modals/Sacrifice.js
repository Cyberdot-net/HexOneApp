import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
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
import { HexOnePriceFeed, HexOneBootstrap, Erc20Contract } from "contracts";
import { ERC20 } from "contracts/Constants";
import { formatDecimal, formatZeroDecimal, formatFloat, isEmpty } from "common/utilities";


export default function Sacrifice({ show, onClose, onSacrifice, day }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ afterDuration, setDuration ] = useState(false);
  const [ hexFeed, setHexFeed ] = useState(0);
  const [ basePoint, setBasePoint ] = useState(0);
  const [ sacrificeAmt, setSacrificeAmt ] = useState({ value: "", bignum: BigNumber.from(0) });
  const [ erc20, setErc20 ] = useState(ERC20[0].id);
  const [ totalHex,  setTotalHex ] = useState(BigNumber.from(0));
  const [ isApproved, setApproved ] = useState(false);

  useEffect(() => {
    if (!address) return;

    showLoading();

    HexOnePriceFeed.setProvider(provider);
    HexOneBootstrap.setProvider(provider);
    Erc20Contract.setProvider(provider);

    const getHexData = async () => {
      showLoading();

      setBasePoint(await HexOneBootstrap.getBasePoint(day));
      setDuration(await HexOneBootstrap.checkSacrificeDuration());

      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  useEffect(() => {

    const getHexData = async () => {
      showLoading();

      Erc20Contract.setTokenType(erc20);
      const decimals = await Erc20Contract.getDecimals();
      setHexFeed(await HexOnePriceFeed.getBaseTokenPrice(erc20, utils.parseUnits("1", decimals)));
      setTotalHex(await Erc20Contract.getBalance(address));

      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [ erc20 ]);

  const changeSacrificeAmt = (e) => {
    setSacrificeAmt({ value: e.target.value, bignum: utils.parseEther(e.target.value || "0") });
  }

  const getTotalUSD = () => {
    const selErc20 = ERC20.find(r => r.id === erc20);
    return sacrificeAmt['bignum'].mul(hexFeed).mul(selErc20.multipler).div(utils.parseUnits("1"));
  }

  const onClickSacrifice = async () => {
    if (isEmpty(sacrificeAmt['bignum']) || sacrificeAmt['bignum'].gt(totalHex)) return;

    const decimals = await Erc20Contract.getDecimals();

    const amount = sacrificeAmt['bignum'].div(utils.parseUnits("1", 18 - decimals));

    if (isApproved) {

      showLoading("Sacrificing...");
  
      const res = await HexOneBootstrap.sacrificeToken(erc20, amount);
      if (res.status !== "success") {
        hideLoading();
        toast.error(res.error ?? "Sacrifice failed! Sacrifice Hex Token error!");
        return;
      }

      setSacrificeAmt({ value: "", bignum: BigNumber.from(0) });
  
      onSacrifice();
      setTotalHex(await Erc20Contract.getBalance(address));
      
      setApproved(false);
      hideLoading();

    } else {

      showLoading("Approving...");

      const allowanceAmount = await Erc20Contract.allowance(address);
      if (allowanceAmount.lt(amount)) {
        const res = await Erc20Contract.approve(amount);
        if (res.status !== "success") {
          hideLoading();
          toast.error(res.error ?? "Borrow failed! HEX Approve error!");
          return;
        }
      }

      setApproved(true);
      hideLoading();

    }
    // onClose();
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
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Sacrifice</h3>
        </div>
      </div>
      <div className="modal-body">
        <MetaMaskAlert isOpen={!address} />
        <Form role="form">
          <FormGroup className="mb-3 mt-3">
            <Row>
              <Label sm="3" className="text-right">ERC20</Label>
              <Col sm="8">
                <Input
                  type="select"
                  name="select"
                  value={erc20}
                  onChange={e => setErc20(e.target.value)}
                >
                  {ERC20.map(r => 
                    <option key={r.id} value={r.id}>{r.name}{r.multipler && ` (${r.multipler}x)`}</option>
                  )}
                </Input>
              </Col>
            </Row>
          </FormGroup>
            <FormGroup className={"mb-3 " + (sacrificeAmt['bignum'].gt(totalHex) && " has-danger")}>
            <Row>
              <Label sm="3" className="text-right">Sacrifice Amount</Label>
              <Col sm="8">
                <Input
                  type="text"
                  placeholder={`Sacrifice Amount in ${ERC20.find(r => r.id === erc20).symbol} (${formatZeroDecimal(totalHex)} ${ERC20.find(r => r.id === erc20).symbol} available)`}
                  value={sacrificeAmt.value}
                  onChange={changeSacrificeAmt} 
                  autoFocus
                  {...(sacrificeAmt['bignum'].gt(totalHex)) && {className: "form-control-danger"}}
                />
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-4">
            <Row>
              <Label sm="3" className="text-right">Total Value USD</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Total Value USD"
                    value={formatDecimal(getTotalUSD())}
                    readOnly
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>USD</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-3">
            <Row>
              <Col sm="3"></Col>
              <Col sm="8">
                <span>Day: <strong className="ml-1">{+day}</strong></span>
                <span className="ml-4">Base Point: <strong className="ml-1">{formatFloat(+utils.formatUnits(basePoint))}</strong></span>
              </Col>
            </Row>
          </FormGroup>
          <div className="text-center">
            <Button
              className="btn-simple my-4"
              color="info"
              id="borrow"
              type="button"
              disabled={!address || afterDuration || totalHex.eq(0)}
              onClick={onClickSacrifice}
            >
              {isApproved ? "Sacrifice" : "Approve"}
            </Button>
            <UncontrolledTooltip
              placement="bottom"
              target="borrow"
            >
              {isApproved ? "Sacrifice tokens" : "Approve tokends"}
            </UncontrolledTooltip>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
