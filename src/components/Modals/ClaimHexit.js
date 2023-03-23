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
import { BigNumber } from "ethers";
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexContract, HexOnePriceFeed } from "contracts";
import { getDailyPool } from "contracts/Constants";
import { formatterFloat } from "common/utilities";


export default function ClaimHexit({ show, onClose, onClaim, day }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ isApproved, setApproved ] = useState(false);
  const [ sacrificedMultiplier, setSacrificeMultiplier ] = useState(9);
  const [ sacrificeUSD, setSacrificeUSD ] = useState(BigNumber.from("0"));
  const [ stakingMultiplier, setStakingMultiplier ] = useState(1);
  const [ stakingUSD, setStakingUSD ] = useState(BigNumber.from("0"));

  useEffect(() => {
    if (!address) return;

    // showLoading();

    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);

    const getHexData = async () => {
      setSacrificeMultiplier(9);
      setSacrificeUSD(BigNumber.from("2500"));

      setStakingMultiplier(1);
      setStakingUSD(BigNumber.from("1700"));

      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  const getShareOfPool = () => {
    const totalUSD = stakingUSD.mul(stakingMultiplier).add(sacrificeUSD.mul(sacrificedMultiplier));
    return getDailyPool(day) * 100 / totalUSD.toString();
  }

  const getTotalHexit = () => {
    return getShareOfPool() * getDailyPool(day);
  }

  const onClickClaimHexit = async () => {

    if (isApproved) {

      showLoading("Claiming...");
  
      onClaim();
      
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
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Claim $HEXIT</h3>
        </div>
      </div>
      <div className="modal-body">
        <MetaMaskAlert isOpen={!address} />
        <Form role="form">
          <FormGroup>
            <Row>
              <Label lg="3" md="5" className="text-right">Sacrifice multiplier</Label>
              <Col lg="2" md="6" className="mb-lg-0 mb-md-3">
                <Input
                  type="text"
                  placeholder="Sacrifice multiplier"
                  value={`${sacrificedMultiplier}x`}
                  readOnly
                />
              </Col>
              <Label lg="3" md="5" className="text-right">Total Sacrificed</Label>
              <Col lg="4" md="6">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Total Sacrificed"
                    value={formatterFloat(+sacrificeUSD)}
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
              <Label lg="3" md="5" className="text-right">Staking multiplier</Label>
              <Col lg="2" md="6" className="mb-lg-0 mb-md-3">
                <Input
                  type="text"
                  placeholder="Staking multiplier"
                  value={`${stakingMultiplier}x`}
                  readOnly
                />
              </Col>
              <Label lg="3" md="5" className="text-right">Hex Staking</Label>
              <Col lg="4" md="6">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Hex Staking"
                    value={formatterFloat(+stakingUSD)}
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
                <span className="ml-4">Daily Pool Total: <strong className="ml-1">{getDailyPool(+day)}</strong></span>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup>
            <Row>
              <Label sm="3" className="text-right">Share of Pool</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Share of Pool"
                    value={getShareOfPool()}
                    readOnly
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>%</InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-3">
            <Row>
              <Label sm="3" className="text-right">Total Hexit</Label>
              <Col sm="8">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Total Hexit"
                    value={getTotalHexit()}
                    readOnly
                  />
                  <InputGroupAddon addonType="append">
                    <InputGroupText>HEXIT</InputGroupText>
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
              onClick={onClickClaimHexit}
            >
              {isApproved ? "Claim $HEXIT" : "Approve"}
            </Button>
            <UncontrolledTooltip
              placement="bottom"
              target="borrow"
            >
              {isApproved ? "Claim $HEXIT" : "Approve HEXIT"}
            </UncontrolledTooltip>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
