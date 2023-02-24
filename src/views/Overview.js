import React, { useState } from "react";
import moment from "moment";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  ListGroupItem,
  ListGroup,
  Row,
  Col
} from "reactstrap";

// core components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";

const colors = [
  '#2dce89',
  '#5ca081',
  '#839878',
  '#a08170',
  '#be6568',
  '#d94e60',
  '#fe365c',
];

export default function Overview() {

  const [ liquidate, setLiquidate ] = useState({});

  React.useEffect(() => {
    setLiquidate({
      stakeid: 3,
      maturityDate: new Date(),
      grace: (Math.round((Math.random() * 1000)) % 7 + 1),
      owedHex1: 122636
    });
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
        <section className="section section-lg section-coins">
          <img
            alt="..."
            className="path"
            src={require("assets/img/path3.png")}
          />
          <Row gutter="10" className="pl-4 pr-4">
            <Col lg="3" md="6" className="mb-2">
              <Card className="card-coin card-plain p-2 h-100">
                <CardBody>
                  <Row>
                    <Col className="text-center" md="12">
                      <h4 className="text-uppercase">Borrow</h4>
                      <hr className="line-primary" />
                    </Col>
                  </Row>
                  <Row>
                    <ListGroup>
                      <ListGroupItem>Mint $HEX1 by creating a stake and borrowing against your stake wich becomes collateral for the Hex One Protocol.</ListGroupItem>
                    </ListGroup>
                  </Row>
                </CardBody>
                <CardFooter className="text-center">
                  <Button className="btn-simple" color="primary">
                    MINT $HEX1
                  </Button>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" className="mb-2">
              <Card className="card-coin card-plain p-2 h-100">
                <CardBody>
                  <Row>
                    <Col className="text-center" md="12">
                      <h4 className="text-uppercase">Claim</h4>
                      <hr className="line-success" />
                    </Col>
                  </Row>
                  <Row>
                    <ListGroup>
                      <ListGroupItem>Claim your $HEX stake by burning the borrowed amount of $HEX1</ListGroupItem>
                    </ListGroup>
                  </Row>
                </CardBody>
                <CardFooter className="text-center">
                  <Button className="btn-simple" color="success">
                    CLAIM $HEX1
                  </Button>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" className="mb-2">
              <Card className="card-coin card-plain p-2 h-100">
                <CardBody>
                  <Row>
                    <Col className="text-center" md="12">
                      <h4 className="text-uppercase">Re-borrow</h4>
                      <hr className="line-info" />
                    </Col>
                  </Row>
                  <Row>
                    <ListGroup>
                      <ListGroupItem>Has the price of $HEX gone up since you initially borrowed? You can borrow more $HEX1 against the collateral already deposited!</ListGroupItem>
                    </ListGroup>
                  </Row>
                </CardBody>
                <CardFooter className="text-center">
                  <Button className="btn-simple" color="info">
                    MORE $HEX1
                  </Button>
                </CardFooter>
              </Card>
            </Col>
            <Col lg="3" md="6" className="mb-2">
              <Card className="card-coin card-plain p-2 h-100">
                <CardBody>
                  <Row>
                    <Col className="text-center" md="12">
                      <h4 className="text-uppercase">Bright Coin</h4>
                      <hr className="line-info" />
                    </Col>
                  </Row>
                  <Row>
                    <ListGroup>
                      <ListGroupItem>Has the price of $HEX gone down since you initially borrowed? You may want to add additional collateral to protect your position from liquidation 7 days after maturity!</ListGroupItem>
                    </ListGroup>
                  </Row>
                </CardBody>
                <CardFooter className="text-center">
                  <Button className="btn-simple" color="info">
                    ADD $HEX
                  </Button>
                </CardFooter>
              </Card>
            </Col>
            <Col lg={{ size: '6', offset: '3'}} md="12" className="mb-2 mt-2">
              <Card className="card-coin card-plain p-2 h-100">
                <CardBody>
                  <Row>
                    <Col className="text-center" md="12">
                      <h4 className="text-uppercase">Liquidate</h4>
                      <hr className="line-info" />
                    </Col>
                  </Row>
                  <Row>
                    <ListGroup>
                      <ListGroupItem>Has the price of $HEX gone down since you initially borrowed? You may want to add additional collateral to protect your position from liquidation 7 days after maturity!</ListGroupItem>
                    </ListGroup>
                  </Row>
                </CardBody>
                <CardFooter className="text-center">
                  <table className="table">
                    <thead>
                        <tr>
                          <th className="text-center">StakeId</th>
                          <th>Maturity date</th>
                          <th>Grace (7 days)</th>
                          <th>Owed $HEX1</th>
                          <th className="text-center">Liquidate</th>
                        </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="text-center">{liquidate.stakeid}</td>
                        <td>{moment(liquidate.maturityDate).format('DD/MM/YY')}</td>
                        <td style={{color: colors[liquidate.grace - 1]}}>{liquidate.grace}</td>
                        <td>{liquidate.owedHex1}</td>
                        <td className="td-actions">
                          <button type="button" rel="tooltip" className="btn btn-success btn-sm btn-icon">
                            <i className="tim-icons icon-cart"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </CardFooter>
              </Card>
            </Col>
          </Row>
        </section>
      </div>
      <Footer />
    </>
  );
}
