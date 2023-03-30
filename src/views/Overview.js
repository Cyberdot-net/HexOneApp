import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
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
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexContract, HexOneProtocol, HexOnePriceFeed } from "contracts";
import { ITEMS_PER_PAGE } from "contracts/Constants";
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import Pagination from "components/Common/Pagination";
import BorrowModal from "components/Modals/Borrow";
import ReborrowModal from "components/Modals/Reborrow";
import { isEmpty, formatFloat } from "common/utilities";

export default function Overview() {
  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ isTestNet, setIsTestNet ] = useState(false);
  const [ hexDecimals, setHexDecimals ] = useState(BigNumber.from(0));
  const [ hexFeed, setHexFeed ] = useState(BigNumber.from(0));
  const [ history, setHistory ] = useState([]);
  const [ liquidates, setLiquidates ] = useState([]);
  const [ isBorrowOpen, setBorrowOpen ] = useState(false);
  const [ reborrow, setReborrow ] = useState({ show: false, data: {} });
  const [ page, setPage ] = useState(1);

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
      setLiquidates(await HexOneVault.getLiquidableDeposits());
      
      const network = await provider.getNetwork();
      setIsTestNet(network.chainId !== 1);

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
    
    return formatFloat(Math.round((currentPrice / originalPrice) * 100));
  }

  const getProfitLoss = (row) => {

    const profit = formatFloat(+(utils.formatUnits(row.currentUSDValue.sub(row.initUSDValue))));
    const percent = formatFloat(+(row.currentUSDValue.div(row.initUSDValue).mul(100)), 0);
    
    return `${profit} (${percent}%)`;
  }

  const onClickClaim = async (depositId) => {
    showLoading("Claiming...");

    const res = await HexOneProtocol.claimCollateral(depositId);
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Claim failed!");
      return;
    }

    getHistory();
    hideLoading();
    toast.success("Claim success!");
  }

  const onClickReborrow = (row) => {
    setReborrow({ show: true, data: {...row, currentFeed: hexFeed} });
  }

  const doMintHex = async () => {

    showLoading("Minting...");

    let res = await HexContract.mint();
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Mint failed!");
      return;
    }
    
    hideLoading();
    toast.success("Mint hex success!");
  }

  const doBorrow = async () => {
    getHistory();
  }

  const doReborrow = () => {
    getHistory();
  }

  return (
    <div className="wrapper">
      <section className="section section-lg section-titles">
        <img
          alt="..."
          className="path"
          src={require("assets/img/path1.png")}
        />
        <Container>
          {!address && <Row gutter="10" className="pl-4 pr-4 center">
            <Col lg="8" md="10" sm="12" className="mb-4">
              <MetaMaskAlert isOpen={!address} />
            </Col>
          </Row>}
          <Row gutter="10" className="pl-4 pr-4">
            <Col lg="12" className="mb-4">
              {isTestNet && <Button
                className="btn-simple mr-4"
                color="info btn-lg"
                id="mint"
                onClick={() => doMintHex()}>
                MINT TESTNET HEX
              </Button>}
              {isTestNet && <UncontrolledTooltip
                placement="bottom"
                target="mint"
              >
                Mint TestNet Hex
              </UncontrolledTooltip>}
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
          src={require("assets/img/path2.png")}
        />
        <Container>
          <Row>
            <Col md="4">
              <hr className="line-info" />
              <h2>Overview</h2>
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
                    <th>Initial HexPrice</th>
                    <th>Current HexPrice</th>
                    <th>Health Ratio</th>
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
                      <td>{formatFloat(+utils.formatUnits(r.depositAmount, hexDecimals))} HEX</td>
                      <td>{formatFloat(+utils.formatUnits(r.effectiveAmount, hexDecimals))} HEX</td>
                      <td>{formatFloat(+utils.formatUnits(r.mintAmount))} HEX1</td>
                      <td>${formatFloat(+utils.formatUnits(r.initialHexPrice))}</td>
                      <td>${formatFloat(+utils.formatUnits(hexFeed))}</td>
                      <td className={+getHealthRatio(r.initialHexPrice) >= 100 ? "green" : "red"}>
                        {getHealthRatio(r.initialHexPrice)}%
                      </td>
                      <td className="td-actions" width="125">
                        <Button
                          id="claim"
                          className="btn btn-primary btn-sm w-full mb-1"
                          onClick={() => onClickClaim(r.depositId)}
                          disabled={r.curHexDay.lte(r.endHexDay)}
                        >
                          Claim
                        </Button>
                        <UncontrolledTooltip
                          placement="bottom"
                          target="claim"
                        >
                          Claim HEX by burning HEX1
                        </UncontrolledTooltip>
                        <Button
                          id="mintHex1"
                          className="btn btn-success btn-sm w-full mb-1"
                          onClick={() => onClickReborrow(r)}
                          disabled={r.borrowableAmount.lte(0)}
                        >
                          Re-Borrow
                        </Button>
                        <UncontrolledTooltip
                          placement="bottom"
                          target="mintHex1"
                        >
                          Mint more $HEX1 without adding any collateral
                        </UncontrolledTooltip>
                      </td>
                    </tr>
                  )) : <tr>
                    <td colSpan={12} className="text-center">                
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
          <Row gutter="10" className="pl-4 pr-4 mt-2 center">
            <Col md="4" sm="6" className="mb-2">
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
            <Col md="4" sm="6" className="mb-2">
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
          </Row>
        </Container>
      </section>
      <section className="section section-lg section-tables">
        <Container>
          <Row>
            <Col md="4">
              <hr className="line-info" />
              <h2>Liquidations</h2>
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
                    <th>Current HexPrice</th>
                    <th>Total Hex</th>
                    <th>Current Value</th>
                    <th>Profit/Loss</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {liquidates.length > 0 ? liquidates.map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{r.depositId.toString()}</td>
                      <td className="text-center">{r.endDay.toString()}</td>
                      <td className="text-center">{r.curHexDay.toString()}</td>
                      <td className={r.graceDay <= 5 ? "green" : (r.graceDay <= 7 ? "yellow" : "red")}>{r.graceDay}</td>
                      <td>{formatFloat(+utils.formatUnits(r.effectiveHex, hexDecimals))} HEX</td>
                      <td>{formatFloat(+utils.formatUnits(r.borrowedHexOne))} HEX1</td>
                      <td>${formatFloat(+utils.formatUnits(hexFeed))}</td>
                      <td>{formatFloat(+utils.formatUnits(r.effectiveHex, hexDecimals))} HEX</td>
                      <td>${formatFloat(+utils.formatUnits(r.currentValue))}</td>
                      <td>{getProfitLoss(r)}</td>
                      <td className="td-actions">
                        <Button
                          id="liquidate"
                          className="btn btn-success btn-sm"
                          onClick={() => onClickClaim(r.depositId)}
                          disabled={!r.liquidable}
                        >
                          Liquidate
                        </Button>
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
                  )) : <tr>
                  <td colSpan={11} className="text-center">                
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
    </div>
  );
}
