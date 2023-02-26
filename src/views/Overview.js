import React, { useState } from "react";
import {
  Button,
  ListGroupItem,
  ListGroup,
  Container,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";

// core components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";

// const colors = [
//   '#2dce89',
//   '#5ca081',
//   '#839878',
//   '#a08170',
//   '#be6568',
//   '#d94e60',
//   '#fe365c',
// ];

export default function Overview() {

  const [ overviews, setOverviews ] = useState([]);
  const [ liquidates, setLiquidates ] = useState([]);

  React.useEffect(() => {

    setOverviews([
      { startDay: 1001, endDay: 5001, stakeid: 123, collateralAmt: 100000, borrowedAmt: 100000, initialAmt: 0.1, currentHex: 0.2, ratio: 100 },
      { startDay: 1123, endDay: 2353, stakeid: 512, collateralAmt: 2500, borrowedAmt: 3000, initialAmt: 0.4, currentHex: 0.1, ratio: 50 },
      { startDay: 1123, endDay: 3255, stakeid: 256, collateralAmt: 2000, borrowedAmt: 2550, initialAmt: 0.0003, currentHex: 0.1, ratio: 5000 },
    ]);

    setLiquidates([
      { startDay: 1001, endDay: 5001, currentDay: 3000, stakeid: 123, grace: 100, borrowedAmt: 100000, initialAmt: 0.1, currentHex: 0.2, currentValue: 250000, ratio: 100, totalHex: 50000 },
    ]);

    document.body.classList.toggle("landing-page");
    // Specify how to clean up after this effect:
    return function cleanup() {
      document.body.classList.toggle("landing-page");
    };
  }, []);

  return (
    <>
      <Navbar />
      <div className="wrapper" style={{minHeight: 'calc(100vh - 293px)'}}>
        <section className="section section-lg section-titles">
          <img
            alt="..."
            className="path"
            src={require("assets/img/path3.png")}
          />
          <Container>
            <Row gutter="10" className="pl-4 pr-4">
              <Col lg="3" md="6" className="mb-2">
                <Button className="btn-simple" color="info">
                  BORROW
                </Button>
              </Col>
              <Col lg="8" md="6" className="mb-2">
                <ListGroup>
                  <ListGroupItem>Stake HEX and Mint $HEX1</ListGroupItem>
                  <ListGroupItem>Borrow up to 100% against your T-shares</ListGroupItem>
                  <ListGroupItem>Each $HEX1 = 1 dollar value of collateralized HEX (T-share)</ListGroupItem>
                  <ListGroupItem>*a 5% fee applies to each deposit</ListGroupItem>
                </ListGroup>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section section-lg section-tables">
          <img
            alt="..."
            className="path"
            src={require("assets/img/path3.png")}
          />
          <Container>
            <Row>
              <Col md="4">
                <hr className="line-info" />
                <h2>
                  OVERVIEW TABLE
                </h2>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <table className="table">
                  <thead>
                      <tr>
                        <th className="text-center">Start</th>
                        <th className="text-center">End</th>
                        <th>Collateral</th>
                        <th>Borrowed Amt</th>
                        <th className="text-center">StakeId</th>
                        <th>Initial HEX/USDC</th>
                        <th>Current HEX/USDC</th>
                        <th>Health Ratio</th>
                        <th className="text-center"></th>
                      </tr>
                  </thead>
                  <tbody>
                    {overviews.map((r, idx) => 
                      <tr key={idx}>
                        <td className="text-center">{r.startDay}</td>
                        <td className="text-center">{r.endDay}</td>
                        <td>{r.collateralAmt.toLocaleString()} HEX</td>
                        <td>{r.borrowedAmt.toLocaleString()} HEX1</td>
                        <td className="text-center">{r.stakeid}</td>
                        <td>${r.initialAmt.toLocaleString()}</td>
                        <td>${r.currentHex.toLocaleString()}</td>
                        <td>{r.ratio.toLocaleString()}%</td>
                        <td className="td-actions">
                          <button type="button" rel="tooltip"  id="claim" className="btn btn-primary btn-sm">
                            Claim
                          </button>
                          <UncontrolledTooltip placement="bottom" target="claim">
                            Mint $HEX1 by depositing HEX
                          </UncontrolledTooltip>
                          <button type="button" rel="tooltip"  id="mintHex1" className="btn btn-success btn-sm">
                            Re-Borrow
                          </button>
                          <UncontrolledTooltip placement="bottom" target="mintHex1">
                            Mint more $HEX1 without adding any collateral
                          </UncontrolledTooltip>
                          <button type="button" rel="tooltip"  id="addCollateral" className="btn btn-info btn-sm">
                            Re-Charge
                          </button>
                          <UncontrolledTooltip placement="bottom" target="addCollateral">
                            Add more collateral (HEX) without borrowing more $HEX1
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section section-lg section-tables">
          <Container>
            <Row>
              <Col md="4">
                <hr className="line-info" />
                <h2>
                  LIQUIDATIONS TABLE
                </h2>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <table className="table">
                  <thead>
                      <tr>
                        <th className="text-center">StakeId</th>
                        <th className="text-center">End</th>
                        <th className="text-center">Current Day</th>
                        <th>Grace</th>
                        <th>Borrowed $HEX1</th>
                        <th>Current HEX/USDC</th>
                        <th>Total Hex</th>
                        <th>Current Value</th>
                        <th>Profit/Loss</th>
                        <th className="text-center"></th>
                      </tr>
                  </thead>
                  <tbody>
                    {liquidates.map((r, idx) => 
                      <tr key={idx}>
                        <td className="text-center">{r.stakeid}</td>
                        <td className="text-center">{r.endDay}</td>
                        <td className="text-center">{r.currentDay}</td>
                        <td>{r.grace}</td>
                        <td>{r.borrowedAmt.toLocaleString()} HEX1</td>
                        <td>${r.currentHex.toLocaleString()}</td>
                        <td>${r.totalHex.toLocaleString()}</td>
                        <td>${r.currentValue.toLocaleString()}</td>
                        <td>{(r.currentValue - r.borrowedAmt).toLocaleString()}</td>
                        <td className="td-actions">
                          <button type="button" rel="tooltip"  id="liquidate" className="btn btn-success btn-sm">
                            Liquidate
                          </button>
                          <UncontrolledTooltip placement="bottom" target="liquidate">
                            Liquidate the position by paying the debt ($HEX1) and the fee (ETH) to claim and receive the T-shares (HEX)
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </Col>
            </Row>
          </Container>
        </section>
      </div>
      <Footer />
    </>
  );
}
