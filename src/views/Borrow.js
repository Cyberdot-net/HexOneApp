import React, { useState, useEffect } from "react";
import { DateRange } from "react-date-range";
import moment from "moment";
import {
  Container,
  Button,
  Card,
  CardHeader,
  CardBody,
  Form,
  FormGroup,
  Row,
  Col,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  UncontrolledTooltip,
} from "reactstrap";

export default function Borrow() {
  const [wallet, setWallet] = useState({
    totalHex: "",
    collateral: "",
    hex_usdc_feed: "",
    borrow_amount: "",
    days: ""
  });
  const [isOpen, setOpen] = useState(false);
  const [days, setDays] = useState([{ startDate: new Date(), endDate: new Date(), key: "selection" }]);

  useEffect(() => {
    setWallet({
      totalHex: 2500,
      collateral: "",
      hex_usdc_feed: 1.02,
      borrow_amount: 2500 * 1.02,
      days: ""
    });

    document.addEventListener("mousedown", bodyMouseDowntHandler);
    return () => {
      document.removeEventListener("mousedown", bodyMouseDowntHandler);
    };
  }, []);

  const bodyMouseDowntHandler = e => {
    const calendar = document.getElementsByClassName("calendar");
    if (calendar?.length && !calendar[0].contains(e.target)) {
      setOpen(false);
    }
  }

  const selectDays = (ranges) => {
    const { selection } = ranges;
    setDays([selection]);
    setWallet(prevWallet => {
      const startDate = moment(selection.startDate);
      const endDate = moment(selection.endDate);
      return { ...prevWallet, days: endDate.diff(startDate, 'days') + 1 };
    });
  }

  const changeWallet = (key, value) => {
    setWallet(prevWallet => {
      return { ...prevWallet, [key]: value };
    });
  }

  return (
    <>
      <div className="wrapper">
        <section className="section section-lg section-titles">
          <img
            alt="..."
            className="path"
            src={require("assets/img/path3.png")}
          />
          <Container>
            <Row>
              <Card className="card-plain p-2 h-100">
                <CardHeader>
                  <h1 className="profile-title text-left">Borrow</h1>
                </CardHeader>
                <CardBody>
                  <Form>
                    <Row>
                      <Col md="6">
                        <FormGroup className={wallet.totalHex < wallet.collateral && "has-danger"}>
                          <InputGroup>
                            <Input
                              type="text"
                              placeholder={`Collateral Amount in HEX (${(wallet.totalHex || 0).toLocaleString()} HEX available)`}
                              value={wallet.collateral}
                              onChange={e => changeWallet('collateral', e.target.value)} 
                              className={wallet.totalHex < wallet.collateral && "form-control-danger"}
                            />
                            <InputGroupAddon addonType="append">
                              <InputGroupText>
                                <i className="tim-icons icon-coins" />
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <InputGroup>
                            <Input
                              type="text"
                              placeholder="Stake Length in Days"
                              value={wallet.days}
                              onChange={e => changeWallet('days', e.target.value)} 
                            />
                            <InputGroupAddon addonType="append" className="pointer" onClick={e => setOpen(!isOpen)}>
                              <InputGroupText>
                                <i className="tim-icons icon-calendar-60" />
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                          {isOpen && <DateRange
                            editableDateInputs={true}
                            onChange={selectDays}
                            moveRangeOnFirstSelection={false}
                            showPreview={false}
                            ranges={days}
                            className="calendar"
                          />}
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <InputGroup>
                            <Input
                              type="text"
                              placeholder="Borrow amount"
                              value={wallet.borrow_amount}
                              onChange={e => changeWallet('borrow_amount', e.target.value)} 
                            />
                            <InputGroupAddon addonType="append">
                              <InputGroupText>
                                <i className="tim-icons icon-coins" />
                              </InputGroupText>
                            </InputGroupAddon>
                          </InputGroup>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Button
                      className="btn-simple float-left mt-4"
                      color="info btn-lg"
                      id="borrow"
                      type="button"
                    >
                      Borrow
                    </Button>
                    <UncontrolledTooltip
                      placement="bottom"
                      target="borrow"
                    >
                      Borrow HEX1 by depositing HEX (T-shares)
                    </UncontrolledTooltip>
                  </Form>
                </CardBody>
              </Card>
            </Row>
          </Container>
        </section>
      </div>
    </>
  );
}
