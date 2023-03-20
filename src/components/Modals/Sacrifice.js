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
  Alert
} from "reactstrap";
import { BigNumber, utils } from "ethers";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexContract } from "contracts";
import { ERC20 } from "contracts/Constants";
import { formatterFloat, isEmpty } from "common/utilities";


export default function Sacrifice({ show, onClose, onSacrifice }) {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ sacrificeAmt, setSacrificeAmt ] = useState({ value: "", bignum: BigNumber.from(0) });
  const [ day, setDay ] = useState(3);
  const [ basePoints, setBasePoints ] = useState(50000);
  const [ isApproved, setApproved ] = useState(false);

  useEffect(() => {
    if (!address) return;

    // showLoading();

    HexContract.setProvider(provider);

    setDay(1);
    setBasePoints(5555555);

    // eslint-disable-next-line
  }, [ address, provider ]);

  const changeSacrificeAmt = (e) => {
    setSacrificeAmt({ value: e.target.value, bignum: utils.parseEther(e.target.value || "0") });
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
              <Label sm="3" className="text-right">ERC20</Label>
              <Col sm="8">
                <Input type="select" name="select">
                  {ERC20.map(r => 
                    <option key={r.id} value={r.id}>{r.name}{r.multipler && ` (${r.multipler}x)`}</option>
                  )}
                </Input>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-3">
            <Row>
              <Label sm="3" className="text-right">Sacrifice Amount</Label>
              <Col sm="8">
                <Input
                  type="text"
                  placeholder="Sacrifice Amount"
                  value={sacrificeAmt.value}
                  onChange={changeSacrificeAmt} 
                  autoFocus
                />
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
                    value={day}
                    readOnly
                  />
                  <InputGroupAddon addonType="append" className="cursor-pointer">
                    <InputGroupText>
                      <i className="tim-icons icon-calendar-60" />
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Col>
            </Row>
          </FormGroup>
          <FormGroup className="mb-3">
            <Row>
              <Label sm="3" className="text-right">Base points</Label>
              <Col sm="8">
                <Input
                  type="text"
                  placeholder="Base points"
                  value={formatterFloat(basePoints)}
                  readOnly
                />
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
