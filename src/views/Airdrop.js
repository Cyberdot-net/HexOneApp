import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import Pagination from "components/Common/Pagination";
import ClaimHexitModal from "components/Modals/ClaimHexit";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexContract, HexOneProtocol, HexOnePriceFeed } from "contracts";
import { ITEMS_PER_PAGE } from "contracts/Constants";
import { formatterFloat } from "common/utilities";

export default function Bootstrap() {
  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ currentDay, setCurrentDay ] = useState(1);
  const [ overviews, setOverview ] = useState([]);
  const [ analysis, setAnalysis ] = useState([]);
  const [ page, setPage ] = useState(1);
  const [ isOpen, setOpen ] = useState(false);
  
  useEffect(() => {
    if (!address) return;

    setOverview([
      { depositId: 4, day: 1, sacrificedUSD: 3600, sacrificedBonus: 9, stakedUSD: 10000, stakedBonus: 1, totalDailyHexit: 15000000, sharePool: 1, claimedHexit: 150000 },
    ]);

    setAnalysis([
      { day: 1, totalDailyHexit: 15000000, totalDistributedHexit: 10000000},
      { day: 2, totalDailyHexit: 7500000, totalDistributedHexit: 7000000},
      { day: 3, totalDailyHexit: 4250000, totalDistributedHexit: 2000000}
    ]);
    
    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);
    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);

    const getData = async () => {
      showLoading();

      setCurrentDay(await HexContract.getCurrentDay());
      
      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  const getTotalUSD = (row) => {
    return row.sacrificedUSD * row.sacrificedBonus + row.stakedUSD * row.stakedBonus;
  }

  const showClaim = () => {

    setOpen(true);
  }

  const doClaimHexit = () => {

  }

  return (
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
              <MetaMaskAlert isOpen={!address} />
            </Col>
          </Row>}
          <h3 className="title text-left mb-2">Day: {currentDay.toString()}</h3>
          <Row gutter="10" className="pl-4 pr-4">
            <Col lg="12" className="mb-4">
              <Button
                className="btn-simple grow"
                color="info btn-lg"
                id="claim"
                onClick={showClaim}
              >
                Claim $HEXIT
              </Button>
              <UncontrolledTooltip
                placement="bottom"
                target="claim"
              >
                Claim $HEXIT
              </UncontrolledTooltip>
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
              <h2>Overview</h2>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center">ClaimId</th>
                    <th>Day</th>
                    <th>Sacrificed Amt USD</th>
                    <th>Sacrificed Bonus</th>
                    <th>Hex Staked USD</th>
                    <th>Hex Staked Bonus</th>
                    <th>Total USD</th>
                    <th>Total Daily HEXIT</th>
                    <th>Share of Pool</th>
                    <th>Claimed HEXIT</th>
                  </tr>
                </thead>
                <tbody>
                  {overviews.length > 0 ? 
                    overviews.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{r.depositId}</td>
                      <td>{r.day.toString()}</td>
                      <td>${formatterFloat(r.sacrificedUSD)}</td>
                      <td>{r.sacrificedBonus}x</td>
                      <td>${formatterFloat(r.stakedUSD)}</td>
                      <td>{r.stakedBonus}x</td>
                      <td>${formatterFloat(getTotalUSD(r))}</td>
                      <td>{formatterFloat(r.totalDailyHexit)} HEXIT</td>
                      <td>{r.sharePool}%</td>
                      <td>{formatterFloat(r.claimedHexit)} HEXIT</td>
                    </tr>
                  )) : <tr>
                    <td colSpan={9} className="text-center">                
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
                count={overviews.length}
                perPage={ITEMS_PER_PAGE}
                onChange={p => setPage(p)}
              />
            </Col>
          </Row>
        </Container>
      </section>
      <section className="section section-lg section-tables">
        <Container>
          <Row>
            <Col md="4">
              <hr className="line-info" />
              <h2>Analysis</h2>
            </Col>
          </Row>
          <Row className="center">
            <Col lg="8" md="12">
              <table className="table">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Total Daily HEXIT</th>
                    <th>Total Distributed HEXIT</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.length > 0 ? 
                    analysis.map((r, idx) => (
                    <tr key={idx}>
                      <td>{r.day}</td>
                      <td>{formatterFloat(r.totalDailyHexit)} HEXIT</td>
                      <td>{formatterFloat(r.totalDistributedHexit)} HEXIT</td>
                    </tr>
                  )) : <tr>
                    <td colSpan={3} className="text-center">                
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
                count={overviews.length}
                perPage={ITEMS_PER_PAGE}
                onChange={p => setPage(p)}
              />
            </Col>
          </Row>
        </Container>
      </section>
      {isOpen && <ClaimHexitModal 
        show={isOpen}
        day={currentDay}
        onClaim={doClaimHexit}
        onClose={() => setOpen(false)}
      />}
    </div>
  );
}
