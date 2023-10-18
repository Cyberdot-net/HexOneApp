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
import { HexOneBootstrap } from "contracts";
import { formatFloat } from "common/utilities";


export default function ClaimHexit({ show, onClose, onClaim }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [isApproved, setApproved] = useState(0);
  const [airdropInfo, setAirdropInfo] = useState({});
  const [totalHexit, setTotalHexit] = useState(BigNumber.from(1))

  useEffect(() => {
    if (!address || !provider) return;

    HexOneBootstrap.setProvider(provider);

    const getHexData = async () => {
      showLoading();

      const tmp = await HexOneBootstrap.getCurrentAirdropInfo(address)
      setAirdropInfo(tmp);
      setApproved(await HexOneBootstrap.checkAirdropInfo(address));
      console.log(await HexOneBootstrap.getCurrentAirdropDay())
      console.log(tmp, totalHexit)
      if (tmp.curDaySupplyHEXIT) {
        console.log(tmp)
        setTotalHexit((tmp.curDaySupplyHEXIT.div(tmp.sacrificedAmount.mul(tmp.sacrificeDistRate).div(1000).add(tmp.stakingShareAmount.mul(tmp.stakingDistRate).div(1000)))))
      }

      hideLoading();
    }

    getHexData();

    // eslint-disable-next-line
  }, [address, provider]);

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
      onClose();

      hideLoading();

    } else {

      showLoading("Approving...");
      const res = await HexOneBootstrap.requestAirdrop();
      if (res.status !== "success") {
        hideLoading();
        toast.error(res.error ?? "Approve failed! Request Airdrop error!");
        return;
      }

      setApproved(1);
      hideLoading();
    }
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
                  value={airdropInfo.sacrificeDistRate ? `${formatFloat(+utils.formatUnits(airdropInfo.sacrificeDistRate, 2))}x` : '0x'}
                  readOnly
                />
              </Col>
              <Label lg="3" md="5" className="text-right">Total Sacrificed</Label>
              <Col lg="4" md="6">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Total Sacrificed"
                    value={airdropInfo.sacrificedAmount ? formatFloat(+utils.formatUnits(airdropInfo.sacrificedAmount)) : '0'}
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
                  value={airdropInfo.stakingDistRate ? `${formatFloat(+utils.formatUnits(airdropInfo.stakingDistRate, 2))}x` : '0x'}
                  readOnly
                />
              </Col>
              <Label lg="3" md="5" className="text-right">Hex Staking</Label>
              <Col lg="4" md="6">
                <InputGroup>
                  <Input
                    type="text"
                    placeholder="Hex Staking"
                    value={airdropInfo.stakingShareAmount ? formatFloat(+utils.formatUnits(airdropInfo.stakingShareAmount, 18)) : "0"}
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
                <span>Day: <strong className="ml-1">{formatFloat(airdropInfo.curAirdropDay)}</strong></span>
                <span className="ml-4">Daily Points: <strong className="ml-1">{airdropInfo.curDaySupplyHEXIT ? formatFloat(+utils.formatUnits(airdropInfo.curDaySupplyHEXIT)) : "0"}</strong></span>
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
                    value={airdropInfo.curDaySupplyHEXIT ? formatFloat(+utils.formatUnits(totalHexit)) : "0"}
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
              disabled={!address || isApproved === 2}
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
