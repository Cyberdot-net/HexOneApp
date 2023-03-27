import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import { Line } from "react-chartjs-2";
import { BigNumber, utils } from "ethers";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import Pagination from "components/Common/Pagination";
import ClaimHexitModal from "components/Modals/ClaimHexit";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneBootstrap } from "contracts";
import { ITEMS_PER_PAGE } from "contracts/Constants";
import { formatterFloat } from "common/utilities";

export default function Bootstrap() {
  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ currentDay, setCurrentDay ] = useState(1);
  const [ airdropList, setAirdropList ] = useState([]);
  const [ chartData, setChartData ] = useState({});
  const [ page, setPage ] = useState(1);
  const [ isOpen, setOpen ] = useState(false);
  
  useEffect(() => {
    if (!address) return;

    setChartData({
      labels: ['1', '2', '3'],
      datasets: [
        {
          label: 'Total Hexit',
          data: [15000000, 7500000, 4250000],
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'transparent',
        },
      ],
    });
    
    HexOneBootstrap.setProvider(provider);

    const getData = async () => {
      showLoading();

      setCurrentDay(await HexOneBootstrap.getCurrentDay());
      setAirdropList(await HexOneBootstrap.getAirdropList(address));
      
      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  const getTotalPower = (row) => {
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
                    <th>Total Power</th>
                    <th>Total Daily HEXIT</th>
                    <th>Share of Pool</th>
                    <th>Claimed HEXIT</th>
                  </tr>
                </thead>
                <tbody>
                  {airdropList.length > 0 ? 
                    airdropList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{r.airdropId.toString()}</td>
                      <td>{r.requestedDay.toString()}</td>
                      <td>${formatterFloat(+utils.formatUnits(r.sacrificeUSD))}</td>
                      <td>{+r.sacrificeMultiplier}x</td>
                      <td>${formatterFloat(+utils.formatUnits(r.hexShares))}</td>
                      <td>{+r.hexShareMultiplier}x</td>
                      <td>${formatterFloat(+utils.formatUnits(r.totalUSD))}</td>
                      <td>{0} HEXIT</td>
                      <td>{0}%</td>
                      <td>{formatterFloat(r.claimedAmount)} HEXIT</td>
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
                count={airdropList.length}
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
              <Line
                data={chartData}
                plugins={[ ChartDataLabels ]}
                legend={{
                  labels: {
                    padding: 20,
                  },
                }}
                options= {{
                  layout: { padding: 50 },
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    datalabels: {
                      color: "rgba(255, 255, 255, 0.8)",
                      align: "top",                      
                      formatter: function(value, context) {
                        return formatterFloat(+value);
                      },
                    },
                  },
                }}
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
