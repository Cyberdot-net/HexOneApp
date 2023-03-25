import React, { useState, useEffect, useContext } from "react";
// import { toast } from "react-hot-toast";
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
import { HexContract, HexOnePriceFeed } from "contracts";
import { ERC20, getBasePoints } from "contracts/Constants";
import { formatDecimal, formatterFloat, isEmpty } from "common/utilities";


export default function Sacrifice({ show, onClose, onSacrifice, day }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ hexFeed, setHexFeed ] = useState(0);
  const [ sacrificeAmt, setSacrificeAmt ] = useState({ value: "", bignum: BigNumber.from(0) });
  const [ erc20, setErc20 ] = useState(ERC20[0].id);
  const [ totalHex,  setTotalHex ] = useState(0);
  const [ isApproved, setApproved ] = useState(false);

  useEffect(() => {
    if (!address) return;

    // showLoading();

    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);

    const getHexData = async () => {
      const decimals = await HexContract.getDecimals();
      setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", decimals)));
      setTotalHex(await HexContract.getBalance(address));

      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  const changeSacrificeAmt = (e) => {
    setSacrificeAmt({ value: e.target.value, bignum: utils.parseEther(e.target.value || "0") });
  }

  const getTotalUSD = () => {
    const selErc20 = ERC20.find(r => r.id === erc20);
    return sacrificeAmt['bignum'].mul(hexFeed).mul(selErc20.multipler).div(utils.parseUnits("1"));
  }

  const onClickSacrifice = async () => {
    if (isEmpty(sacrificeAmt['bignum'])) return;

    if (isApproved) {

      showLoading("Sacrificing...");
  
      setSacrificeAmt({ value: "", bignum: BigNumber.from(0) });
  
      onSacrifice();
      
      setApproved(false);
      hideLoading();

    } else {

      showLoading("Approving...");

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
                  placeholder={`Sacrifice Amount in HEX (${formatDecimal(totalHex)} HEX available)`}
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
                <span className="ml-4">Base Point: <strong className="ml-1">{formatterFloat(getBasePoints(+day))}</strong></span>
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
