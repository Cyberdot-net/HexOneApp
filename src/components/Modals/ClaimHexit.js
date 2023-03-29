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
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneBootstrap } from "contracts";
import { formatFloat, formatDecimal, formatZeroDecimal } from "common/utilities";


export default function ClaimHexit({ show, onClose, onClaim, day }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ isApproved, setApproved ] = useState(false);
  const [ airdropInfo, setAirdropInfo ] = useState({});

  useEffect(() => {
    if (!address) return;

    HexOneBootstrap.setProvider(provider);

    const getHexData = async () => {
      showLoading();
      setAirdropInfo(await HexOneBootstrap.getCurrentAirdropInfo(address));
      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  const onClickClaimHexit = async () => {

    if (isApproved) {

      showLoading("Claiming...");
  
      const res = await HexOneBootstrap.claimAirdrop();
      if (res.status !== "success") {
        hideLoading();
        toast.error(res.error ?? "Claim failed!");
        return;
      }
  
      onClaim();
      
      setApproved(false);
      hideLoading();

    } else {

      showLoading("Approving...");
      const res = await HexOneBootstrap.requestAirdrop();
      if (res.status !== "success") {
        hideLoading();
        toast.error(res.error ?? "Approve failed! Request Airdrop error!");
        return;
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
          <h3 className="mb-0"><i className="tim-icons tim-icons-lg icon-coins mr-1" /> Claim $HEXIT</h3>
        </div>
      </div>
      <div className="modal-body">
        <MetaMaskAlert isOpen={!address} />
        <Form role="form">
          <FormGroup>
            <Row className="mt-3">
              <Label lg="3" md="5" className="text-right">Sacrifice multiplier</Label>
              <Col lg="2" md="6" className="mb-lg-0 mb-md-3">
                <Input
                  type="text"
                  placeholder="Sacrifice multiplier"
                  value={`${formatFloat(+airdropInfo.sacrificeDistRate)}x`}
                  readOnly
                />
              </Col>
              <Label lg="3" md="5" className="text-right">Total Sacrificed</Label>
              <Col lg="4" md="6">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Total Sacrificed"
                    value={formatDecimal(airdropInfo.sacrificedAmount)}
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
                  value={`${formatFloat(+airdropInfo.stakingDistRate)}x`}
                  readOnly
                />
              </Col>
              <Label lg="3" md="5" className="text-right">Hex Staking</Label>
              <Col lg="4" md="6">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Hex Staking"
                    value={formatDecimal(airdropInfo.stakingShareAmount)}
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
                <span>Day: <strong className="ml-1">{formatFloat(+airdropInfo.curAirdropDay)}</strong></span>
                <span className="ml-4">Daily Pool Total: <strong className="ml-1">{formatZeroDecimal(airdropInfo.curDayPoolAmount)}</strong></span>
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
                    value={formatDecimal(airdropInfo.shareOfPool)}
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
                    value={formatDecimal(airdropInfo.curDaySupplyHEXIT)}
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
