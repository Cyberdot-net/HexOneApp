import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  ListGroupItem,
  ListGroup,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import { BigNumber, utils } from "ethers";
import { WalletContext, MessageContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexContract, HexOneProtocol, HexOnePriceFeed } from "contracts";
import { ITEMS_PER_PAGE } from "contracts/Constants";
import BorrowModal from "components/Modals/Borrow";
import ReborrowModal from "components/Modals/Reborrow";
import RechargeModal from "components/Modals/Recharge";
import Pagination from "components/Common/Pagination";
import { isEmpty } from "common/utilities";

export default function Overview() {
  const { address, provider } = useContext(WalletContext);
  const { showMessage } = useContext(MessageContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ hexDecimals, setHexDecimals ] = useState(BigNumber.from(0));
  const [ hexFeed, setHexFeed ] = useState(BigNumber.from(0));
  const [ history, setHistory ] = useState([]);
  const [ liquidates, setLiquidates ] = useState([]);
  const [ isBorrowOpen, setBorrowOpen ] = useState(false);
  const [ reborrow, setReborrow ] = useState({ show: false, data: {} });
  const [ recharge, setRecharge ] = useState({ show: false, data: {} });
  const [ page, setPage ] = useState(1);
  
  useEffect(() => {
    setLiquidates([
      {
        stakeid: 123,
        startDay: 1001,
        endDay: 2993,
        currentDay: 3000,
        grace: 8,
        borrowedAmt: 100000,
        effectiveHex: 2205,
        currentHex: 0.2,
        totalHex: 50000,
        currentValue: 10000,
        profitloss: 2000
      },
      {
        stakeid: 726,
        startDay: 1001,
        endDay: 3002,
        currentDay: 3000,
        grace: 5,
        borrowedAmt: 500000,
        effectiveHex: 2205,
        currentHex: 0.2,
        totalHex: 100000,
        currentValue: 20000,
        profitloss: -200000
      },
      {
        stakeid: 435,
        startDay: 1001,
        endDay: 3000,
        currentDay: 3000,
        grace: 7,
        borrowedAmt: 1000000,
        effectiveHex: 2205,
        currentHex: 0.2,
        totalHex: 4000000,
        currentValue: 800000,
        profitloss: -200000
      },
    ]);
  }, []);

  useEffect(() => {
    if (!address) return;

    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);
    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);

    const getData = async () => {
      showLoading();

      const decimals = await HexContract.getDecimals();
      setHexDecimals(decimals);
      setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", decimals)));
      setHistory(await HexOneVault.getHistory(address));

      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  const getHistory = async () => {
    setHistory(await HexOneVault.getHistory(address));
  }

  const getHealthRatio = (initialFeed) => {
    if (isEmpty(initialFeed)) return 0;

    const currentPrice = +utils.formatUnits(hexFeed);
    const originalPrice = +utils.formatUnits(initialFeed);
    
    return Math.round((currentPrice / originalPrice) * 100);
  }

  const onClickClaim = async (row) => {
    showLoading("Claiming...");

    const res = await HexOneProtocol.claimCollateral(row.depositId);
    if (res.status !== "success") {
      hideLoading();
      showMessage(res.error ?? "Claim failed!", "error");
      return;
    }

    hideLoading();
    showMessage("Claim success!", "info");
  }

  const onClickReborrow = (row) => {
    setReborrow({ show: true, data: {...row, currentFeed: hexFeed} });
  }

  const onClickRecharge = (row) => {
    setRecharge({ show: true, data: row });
  }

  const doMintHex = async () => {

    showLoading("Minting...");

    console.log(HexContract.provider);

    let res = await HexContract.mint();
    if (res.status !== "success") {
      hideLoading();
      showMessage(res.error ?? "Mint failed!", "error");
      return;
    }
    
    hideLoading();
    showMessage("Mint hex success!", "info");
  }

  const doBorrow = async () => {
    getHistory();
  }

  const doReborrow = () => {
    getHistory();
  }

  const doRecharge = () => {
    getHistory();
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
            {!address && <Row gutter="10" className="pl-4 pr-4 center">
              <Col lg="8" md="10" sm="12" className="mb-4">
                <Alert
                  className="alert-with-icon"
                  color="danger"
                >
                  <span data-notify="icon" className="tim-icons icon-alert-circle-exc" />
                  <span><b>No MetaMask! - </b>Please, connect MetaMask</span>
                </Alert>
              </Col>
            </Row>}
            <Row gutter="10" className="pl-4 pr-4">
              <Col lg="12" className="mb-4">
                <Button
                  className="btn-simple mr-4"
                  color="info btn-lg"
                  id="mint"
                  onClick={() => doMintHex()}>
                  MINT HEX
                </Button>
                <UncontrolledTooltip
                  placement="bottom"
                  target="mint"
                >
                  Mint hex
                </UncontrolledTooltip>
                <Button
                  className="btn-simple grow"
                  color="info btn-lg"
                  id="borrow"
                  onClick={() => setBorrowOpen(true)}>
                  BORROW
                </Button>
                <UncontrolledTooltip
                  placement="bottom"
                  target="borrow"
                >
                  Borrow HEX1 by depositing HEX (T-shares)
                </UncontrolledTooltip>
              </Col>
            </Row>
            <Row gutter="10" className="pl-4 pr-4">
              <Col lg="12" className="mb-2">
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
          <Container className="w-full">
            <Row>
              <Col md="4">
                <hr className="line-info" />
                <h2>OVERVIEW</h2>
              </Col>
            </Row>
            <Row>
              <Col md="12">
                <table className="table">
                  <thead>
                    <tr>
                      <th className="text-center">StakeId</th>
                      <th className="text-center">Start</th>
                      <th className="text-center">End</th>
                      <th className="text-center">Current</th>
                      <th>Collateral</th>
                      <th>Effective</th>
                      <th>Borrowed Amt</th>
                      <th>Initial HEX/USDC</th>
                      <th>Current HEX/USDC</th>
                      <th>Health Ratio</th>
                      <th className="text-center">Committed</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? 
                      history.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((r, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{r.depositId.toString()}</td>
                        <td className="text-center">{r.lockedHexDay.toString()}</td>
                        <td className="text-center">{r.endHexDay.toString()}</td>
                        <td className="text-center">{r.curHexDay.toString()}</td>
                        <td>{utils.formatUnits(r.depositAmount, hexDecimals)} HEX</td>
                        <td>{0} HEX</td>
                        <td>{utils.formatUnits(r.mintAmount)} HEX1</td>
                        <td>${0}</td>
                        <td>${utils.formatUnits(hexFeed)}</td>
                        <td className={0 >= 100 ? "green" : "red"}>
                          {getHealthRatio(hexFeed).toString()}%
                        </td>
                        <td>{r.commitType ? "Yes" : "No"}</td>
                        <td className="td-actions" width="125">
                          <button
                            type="button"
                            rel="tooltip"
                            id="claim"
                            className="btn btn-primary btn-sm w-full mb-1"
                            onClick={() => onClickClaim(r)}
                            disabled={r.curHexDay.lte(r.endHexDay)}
                          >
                            Claim
                          </button>
                          <UncontrolledTooltip
                            placement="bottom"
                            target="claim"
                          >
                            Claim HEX by burning HEX1
                          </UncontrolledTooltip>
                          <button
                            type="button"
                            rel="tooltip"
                            id="mintHex1"
                            className="btn btn-success btn-sm w-full mb-1"
                            onClick={() => onClickReborrow(r)}
                            disabled={r.curHexDay.gt(r.endHexDay)}
                          >
                            Re-Borrow
                          </button>
                          <UncontrolledTooltip
                            placement="bottom"
                            target="mintHex1"
                          >
                            Mint more $HEX1 without adding any collateral
                          </UncontrolledTooltip>
                          <button
                            type="button"
                            rel="tooltip"
                            id="addCollateral"
                            className="btn btn-info btn-sm w-full"
                            onClick={() => onClickRecharge(r)}
                            disabled={r.curHexDay.lte(r.endHexDay)}
                          >
                            Re-Charge
                          </button>
                          <UncontrolledTooltip
                            placement="bottom"
                            target="addCollateral"
                          >
                            Add more collateral (HEX) without borrowing more $HEX1
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                    )) : <tr>
                      <td colSpan={10} className="text-center">                
                        <Alert
                          className="alert-with-icon"
                          color="default"
                        >
                          <span>There are no matching entries</span>
                        </Alert>
                      </td>
                    </tr>}
                  </tbody>
                </table>
              </Col>
              <Col md="12">
                <Pagination 
                  className="mb-3"
                  page={page}
                  count={history.length}
                  perPage={ITEMS_PER_PAGE}
                  onChange={p => setPage(p)}
                />
              </Col>
            </Row>
            <Row gutter="10" className="pl-4 pr-4 mt-2">
              <Col md="4" className="mb-2">
                <Card className="card-coin card-plain p-2 h-100">
                  <CardBody>
                    <Row>
                      <Col className="text-center" md="12">
                        <h4 className="text-uppercase">CLAIM</h4>
                        <hr className="line-primary" />
                      </Col>
                    </Row>
                    <Row>
                      <ListGroup>
                        <ListGroupItem>
                          Claim your collateral (HEX)
                        </ListGroupItem>
                        <ListGroupItem>
                          by repaying the loan (HEX1)
                        </ListGroupItem>
                      </ListGroup>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4" className="mb-2">
                <Card className="card-coin card-plain p-2 h-100">
                  <CardBody>
                    <Row>
                      <Col className="text-center" md="12">
                        <h4 className="text-uppercase">RE-BORROW</h4>
                        <hr className="line-primary" />
                      </Col>
                    </Row>
                    <Row>
                      <ListGroup>
                        <ListGroupItem>Borrow more HEX1 without</ListGroupItem>
                        <ListGroupItem>
                          adding additional collateral
                        </ListGroupItem>
                      </ListGroup>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col md="4" className="mb-2">
                <Card className="card-coin card-plain p-2 h-100">
                  <CardBody>
                    <Row>
                      <Col className="text-center" md="12">
                        <h4 className="text-uppercase">RE-CHARGE</h4>
                        <hr className="line-primary" />
                      </Col>
                    </Row>
                    <Row>
                      <ListGroup>
                        <ListGroupItem>Add collateral (HEX)</ListGroupItem>
                        <ListGroupItem>without minting HEX1</ListGroupItem>
                      </ListGroup>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
        <section className="section section-lg section-tables">
          <Container>
            <Row>
              <Col md="4">
                <hr className="line-info" />
                <h2>LIQUIDATIONS</h2>
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
                      <th>Effective Hex</th>
                      <th>Borrowed $HEX1</th>
                      <th>Current HEX/USDC</th>
                      <th>Total Hex</th>
                      <th>Current Value</th>
                      <th>Profit/Loss</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {liquidates.map((r, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{r.stakeid}</td>
                        <td className="text-center">{r.endDay}</td>
                        <td className="text-center">{r.currentDay}</td>
                        <td className={r.grace <= 5 ? "green" : (r.grace <= 7 ? "yellow" : "red")}>{r.grace}</td>
                        <td>{r.effectiveHex.toLocaleString()} HEX</td>
                        <td>{r.borrowedAmt.toLocaleString()} HEX1</td>
                        <td>${r.currentHex.toLocaleString()}</td>
                        <td>{r.totalHex.toLocaleString()}</td>
                        <td>${r.currentValue.toLocaleString()}</td>
                        <td>${(r.currentValue - r.borrowedAmt).toLocaleString()} (%{r.borrowedAmt ? Math.round(r.currentValue / r.borrowedAmt * 100) : 0})</td>
                        <td className="td-actions">
                          <button
                            type="button"
                            rel="tooltip"
                            id="liquidate"
                            className="btn btn-success btn-sm"
                            disabled={r.grace <= 7}
                          >
                            Liquidate
                          </button>
                          <UncontrolledTooltip
                            placement="bottom"
                            target="liquidate"
                          >
                            Liquidate the position by paying the debt ($HEX1)
                            and the fee (ETH) to claim and receive the T-shares
                            (HEX)
                          </UncontrolledTooltip>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Col>
            </Row>
            <Row gutter="10" className="pl-4 pr-4 mt-2 justify-content-md-center">
              <Col md="4" className="mb-2">
                <Card className="card-coin card-plain p-2 h-100">
                  <CardBody>
                    <Row>
                      <Col className="text-center" md="12">
                        <h4 className="text-uppercase">LIQUIDATE</h4>
                        <hr className="line-primary" />
                      </Col>
                    </Row>
                    <Row>
                      <ListGroup>
                        <ListGroupItem>Repay borrowed HEX1</ListGroupItem>
                        <ListGroupItem>claim the collateral (HEX)</ListGroupItem>
                      </ListGroup>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </Container>
        </section>
        {isBorrowOpen && <BorrowModal 
          show={isBorrowOpen}
          onBorrow={doBorrow}
          onClose={() => setBorrowOpen(false)}
        />}
        {reborrow.show && <ReborrowModal 
          show={reborrow.show}
          data={reborrow.data}
          onReborrow={doReborrow}
          onClose={() => setReborrow({ show: false, data: {} })}
        />}
        {recharge.show && <RechargeModal 
          show={recharge.show}
          data={recharge.data}
          onRecharge={doRecharge}
          onClose={() => setRecharge({ show: false, data: {} })}
        />}
      </div>
    </>
  );
}
