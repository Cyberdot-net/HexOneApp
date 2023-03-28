import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-hot-toast";
import {
  Button,
  Container,
  Row,
  Col,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartDataOutLabels from 'chartjs-plugin-piechart-outlabels';
import { BigNumber, utils } from "ethers";
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import SacrificeModal from "components/Modals/Sacrifice";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexContract, HexOneProtocol, HexOnePriceFeed, HexOneBootstrap, HexOneEscrow } from "contracts";
import { isEmpty, formatterFloat } from "common/utilities";


const backgroundColor = {
  "HEX": 'rgba(255, 99, 132, 0.2)',
  "USDC": 'rgba(54, 162, 235, 0.2)',
  "ETH": 'rgba(255, 206, 86, 0.2)',
  "DAI": 'rgba(75, 192, 192, 0.2)',
  "UNI": 'rgba(153, 102, 255, 0.2)',
  "": 'rgba(255, 159, 64, 0.2)'
};

export default function Bootstrap() {
  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ hexFeed, setHexFeed ] = useState(BigNumber.from(0));
  const [ currentDay, setCurrentDay ] = useState(1);
  const [ isOpen, setOpen ] = useState(false);
  const [ sacrificeList, setSacrificeList ] = useState([]);
  const [ shareInfo, setShareInfo ] = useState(null);
  const [ chartData, setChartData ] = useState(null);
  
  useEffect(() => {
    if (!address) return;
    
    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);
    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);
    HexOneBootstrap.setProvider(provider);
    HexOneEscrow.setProvider(provider);

    const getData = async () => {
      showLoading();

      const decimals = await HexContract.getDecimals();
      setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", decimals)));
      setCurrentDay(await HexOneBootstrap.getCurrentDay());
      setSacrificeList(await HexOneBootstrap.getSacrificeList(address));
      setShareInfo(await HexOneEscrow.getOverview(address));
      
      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [ address, provider ]);


  useEffect(() => {

    const labels = sacrificeList.map(r => r.tokenName || "");
    const data = sacrificeList.map(r => +utils.formatUnits(r.sacrificedAmount));
    const backgroundColors = sacrificeList.map(r => r.tokenName in backgroundColor ? backgroundColor[r.tokenName] : backgroundColor[""]);

    if (data.length > 0) {
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Sacrificed AMT',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: sacrificeList.map(r => 'rgba(255, 255, 255, 0.3)'),
            borderWidth: 2,
          },
        ],
      });
    } else {
      setChartData(null);
    }

  }, [ sacrificeList ]);

  const getSacrificeList = async () => {
    setSacrificeList(await HexOneBootstrap.getSacrificeList());
  }

  const getHealthRatio = (initialFeed) => {
    if (isEmpty(initialFeed)) return 0;

    const currentPrice = +utils.formatUnits(hexFeed);
    const originalPrice = +utils.formatUnits(initialFeed);
    
    return formatterFloat(Math.round((currentPrice / originalPrice) * 100));
  }

  const onClickClaim = async (sacrificeId) => {
    showLoading("Claiming $HEXIT...");

    const res = await HexOneBootstrap.claimSacrifice(sacrificeId);
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Claim failed!");
      return;
    }

    getSacrificeList();
    hideLoading();
    toast.success("Claim $HEXIT success!");
  }

  const doSacrifice = () => {
    getSacrificeList();
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
                id="sacrifice"
                onClick={() => setOpen(true)}
              >
                Sacrifice
              </Button>
              <UncontrolledTooltip
                placement="bottom"
                target="sacrifice"
              >
                Sacrifice tokens
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
                    <th className="text-center">ShareId</th>
                    <th>Day</th>
                    <th>Base Points</th>
                    <th>ERC20 [name]</th>
                    <th>Bonus</th>
                    <th>Total Points</th>
                    <th>Sacrificed Amt</th>
                    <th>USD Value</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {sacrificeList.length > 0 ? 
                    sacrificeList.map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{r.sacrificeId.toString()}</td>
                      <td className="text-center">{r.day.toString()}</td>
                      <td>{formatterFloat(+utils.formatUnits(r.supplyAmount))}</td>
                      {/* <td>{formatterFloat(getBasePoints(+r.day))}</td> */}
                      <td></td>
                      <td>{r.multiplier.toString()}x</td>
                      <td></td>
                      <td>{formatterFloat(+utils.formatUnits(r.sacrificedAmount))}</td>
                      <td>{formatterFloat(+utils.formatUnits(r.usdValue))}</td>
                      <td className="td-actions" width="100">
                        <Button
                          id="claim"
                          className="btn btn-primary btn-sm w-full"
                        >
                          Claim<br/>$HEXIT
                        </Button>
                        <UncontrolledTooltip
                          placement="bottom"
                          target="claim"
                          onClick={() => onClickClaim(r.sacrificeId)}
                        >
                          Claim $HEXIT
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
          </Row>
        </Container>
      </section>
      <section className="section section-lg section-tables">
        <Container>
          <Row>
            <Col md="4">
              <hr className="line-info" />
              <h2>Bootstrap Sacrifice Hex1 Share</h2>
            </Col>
          </Row>
          <Row>
            <Col md="12">
              <table className="table">
                <thead>
                  <tr>
                    <th>TOTAL USD VALUE</th>
                    <th>POOL SHARE</th>
                    <th>START</th>
                    <th>END</th>
                    <th>COLLATERAL</th>
                    <th>EFFECTIVE</th>
                    <th>BORROWED AMT</th>
                    <th>INITIAL HEX/USDC</th>
                    <th>CURRENT HEX/USDC</th>
                    <th>HEALTH RATIO</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {shareInfo ? 
                    <tr>
                      <td>${formatterFloat(+utils.formatUnits(shareInfo.totalUSDValue))}</td>
                      <td>{shareInfo.shareOfPool.toString()}%</td>
                      <td>{shareInfo.startTime.toString()}</td>
                      <td>{shareInfo.endTime.toString()}</td>
                      <td>{formatterFloat(+utils.formatUnits(shareInfo.hexAmount))} HEX</td>
                      <td>{formatterFloat(+utils.formatUnits(shareInfo.effectiveAmount))} HEX</td>
                      <td>{formatterFloat(+utils.formatUnits(shareInfo.borrowedAmount))} HEX1</td>
                      <td>${formatterFloat(+utils.formatUnits(shareInfo.initUSDValue))}</td>
                      <td>${formatterFloat(+utils.formatUnits(hexFeed))}</td>
                      <td className={+getHealthRatio(shareInfo.initUSDValue) >= 100 ? "green" : "red"}>
                        {getHealthRatio(shareInfo.initUSDValue)}%
                      </td>
                      <td className="td-actions" width="100">
                        <Button
                          id="claim"
                          className="btn btn-primary btn-sm w-full"
                          disabled={shareInfo.borrowedAmount.lte(0)}
                        >
                          Claim<br/>Hex1
                        </Button>
                        <UncontrolledTooltip
                          placement="bottom"
                          target="claim"
                        >
                          Claim Hex1
                        </UncontrolledTooltip>
                      </td>
                    </tr> : <tr>
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
          </Row>
        </Container>
      </section>
      <section className="section section-lg section-tables center">
        <Container>
          <Row>
            <Col md="4">
              <hr className="line-info" />
              <h2>Analysis</h2>
            </Col>
          </Row>
          <Row className="center">
            <Col lg="8" md="12">
              {chartData ? 
              <Pie
                data={chartData}
                plugins={[ ChartDataLabels, ChartDataOutLabels ]}
                legend={{
                  labels: {
                    padding: 20,
                  },
                }}
                options= {{
                  layout: { padding: 50 },
                  legend: { display: false },
                  plugins: {
                    datalabels: {
                      color: "rgba(255, 255, 255, 0.8)",
                      textAlign: 'center',
                      opacity: 0.8,
                      formatter: function(value, context) {
                        const sum = chartData.datasets[0]?.data?.reduce((s, o)=> s + o, 0);
                        const label = context.chart.data.labels[context.dataIndex];
                        if (sum) {
                          return [label, `${sum ? Math.round(value / sum * 100) : 0}%`]; 
                        } else {
                          return "";
                        }
                      }
                    },
                    outlabels: {
                      font: { size: 15 },
                      stretch: 20,
                      text: (context) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        const value = context.dataset.data[context.dataIndex];
                        return `${label} ${value}`;
                      }
                    }
                  }
                }}
                /> :
                <h3 className="text-center">
                  No Analysis Data
                </h3>
              }
            </Col>
          </Row>
        </Container>
      </section>
      {isOpen && <SacrificeModal 
        show={isOpen}
        day={currentDay}
        onSacrifice={doSacrifice}
        onClose={() => setOpen(false)}
      />}
    </div>
  );
}
