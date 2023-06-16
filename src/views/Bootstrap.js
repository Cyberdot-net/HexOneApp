import React, { useState, useEffect, useContext } from "react";
import { useMediaQuery } from 'react-responsive';
import { toast } from "react-hot-toast";
import {
  Modal,
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
import { WalletContext, LoadingContext, TimerContext } from "providers/Contexts";
import { HexOneVault, HexContract, HexOneProtocol, HexOnePriceFeed, HexOneBootstrap, HexOneEscrow, ERC20Contract } from "contracts";
import { Erc20_Tokens_Addr, Hexit_Addr } from "contracts/address";
import { ERC20 } from "contracts/Constants";
import { isEmpty, formatFloat } from "common/utilities";


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
  const { timer } = useContext(TimerContext);
  const [ decimals, setDecimals ] = useState({});
  const [ hexFeed, setHexFeed ] = useState(BigNumber.from(0));
  const [ currentDay, setCurrentDay ] = useState(0);
  const [ isOpen, setOpen ] = useState(false);
  const [ sacrificeList, setSacrificeList ] = useState([]);
  const [ shareInfo, setShareInfo ] = useState(null);
  const [ chartData, setChartData ] = useState(null);
  const [ result, showResult ] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
  

  useEffect(() => {
    if (!timer || !HexOneBootstrap.connected() || Object.keys(decimals).length === 0) return;

    const getData = async () => {
      setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", decimals["HEX"])));
      setCurrentDay(await HexOneBootstrap.getCurrentSacrificeDay());
      setShareInfo(await HexOneEscrow.getOverview(address));
      
      const sacrificeData = await HexOneBootstrap.getSacrificeList(address);
      setSacrificeList(sacrificeData);
      drawPieChart(sacrificeData, decimals)
    }

    getData();    
    // eslint-disable-next-line
  }, [ timer ]);

  
  useEffect(() => {
    if (!address || !provider) return;
    
    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);
    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);
    HexOneBootstrap.setProvider(provider);
    HexOneEscrow.setProvider(provider);

    const getData = async () => {
      showLoading();

      const ercDecimals = {};
      for (let erc of ERC20) {
        ERC20Contract.setProvider(provider, Erc20_Tokens_Addr[erc.id].contract);
        ercDecimals[erc.id] = await ERC20Contract.getDecimals();
      }
      setDecimals(ercDecimals);

      setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", ercDecimals["HEX"])));
      setCurrentDay(await HexOneBootstrap.getCurrentSacrificeDay());
      setShareInfo(await HexOneEscrow.getOverview(address));
      
      const sacrificeData = await HexOneBootstrap.getSacrificeList(address);
      setSacrificeList(sacrificeData);
      drawPieChart(sacrificeData, ercDecimals)

      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [ address, provider ]);


  const drawPieChart = async (sacrificeData, ercDecimals) => {
    const labels = sacrificeData.map(r => r.sacrificeTokenSymbol || "");
    const data = sacrificeData.map(r => +utils.formatUnits(r.sacrificedAmount, ercDecimals[r.sacrificeTokenSymbol] || 0));
    const backgroundColors = labels.map(r => r in backgroundColor ? backgroundColor[r] : backgroundColor[""]);

    if (data.length > 0) {
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Sacrificed AMT',
            data: data,
            backgroundColor: backgroundColors,
            borderColor: data.map(r => 'rgba(255, 255, 255, 0.3)'),
            borderWidth: 2,
          },
        ],
      });
    } else {
      setChartData(null);
    }
  }

  const getSacrificeList = async () => {
    const sacrificeData = await HexOneBootstrap.getSacrificeList(address);
    setSacrificeList(sacrificeData);
    drawPieChart(sacrificeData, decimals);
  }

  const getHealthRatio = (initialFeed) => {
    if (isEmpty(initialFeed)) return 0;

    const currentPrice = +utils.formatUnits(hexFeed);
    const originalPrice = +utils.formatUnits(initialFeed);
    
    return formatFloat(Math.round((currentPrice / originalPrice) * 100));
  }

  // const getTotalHexit = (row) => {
  //   return formatFloat(+utils.formatUnits(row.sacrificedAmount.mul(utils.parseUnits("1", 15 - (decimals[row.sacrificeTokenSymbol] || 0))).mul(row.multiplier).mul(row.supplyAmount).div(utils.parseUnits("1"))));
  // }

  const onClickClaim = async (sacrificeId) => {
    showLoading("Claiming $HEXIT...");

    const res = await HexOneBootstrap.claimSacrifice(sacrificeId);
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Claim failed!");
      return;
    }

    await getSacrificeList();
    
    hideLoading();

    toast.success("Claim $HEXIT success!");
  }

  const onClickClaimHex1 = async () => {
    showLoading("Claiming Hex1...");

    const res = await HexOneEscrow.reDepositCollateral();
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Claim failed!");
      return;
    }

    setShareInfo(await HexOneEscrow.getOverview(address));
    
    hideLoading();

    showResult(true);
  }

  const doSacrifice = async () => {
    await getSacrificeList();
  }

  const onClickAddHexitToken = async () => {    
    if (!address || !provider) return;

    if (typeof window.ethereum === 'undefined') {
      toast.error("<b>No MetaMask! - </b>Please, install MetaMask");
      return;
    }

    showLoading("Adding...");

    // Add hexit to MetaMask
    try {
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: Hexit_Addr.contract,
            symbol: "HEXIT",
            decimals: 18,
          },
        },
      });
     
      hideLoading();
      if (wasAdded) {
        toast.success("Added hexit to MetaMask");
      } else {
        toast.error("Failed to add hexit to MetaMask");
      }

    } catch (error) {
      hideLoading();

      if (error.code === 4001) {
        toast.error(`Add failed! ${error.message}`);
      } else {
        toast.error(`Add failed! ${error.message}`);
      }

      return;
    }
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
            <Col md="12" className="overflow-y">
              <table className="table">
                <thead>
                  <tr>
                    <th className="text-center">ShareId</th>
                    <th>Day</th>
                    <th>Base {isMobile && <br />}Points</th>
                    <th>ERC20 {isMobile && <br />}[name]</th>
                    <th>Bonus</th>
                    <th>Sacrificed {isMobile && <br />}Amt</th>
                    <th>Total {isMobile && <br />}Hexit</th>
                    <th>USD {isMobile && <br />}Value</th>
                    <th className="text-center"></th>
                  </tr>
                </thead>
                <tbody>
                  {sacrificeList.length > 0 ? 
                    sacrificeList.map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{r.sacrificeId.toString()}</td>
                      <td className="text-center">{r.day.toString()}</td>
                      <td>{formatFloat(+utils.formatUnits(r.supplyAmount))}</td>
                      <td>{r.sacrificeTokenSymbol}</td>
                      <td>{utils.formatUnits(r.multiplier, 3).toString()}x</td>
                      <td>{formatFloat(+utils.formatUnits(r.sacrificedAmount, decimals[r.sacrificeTokenSymbol] || 0))}</td>
                      <td>{formatFloat(+utils.formatUnits(r.totalHexitAmount))}</td>
                      <td>${formatFloat(+utils.formatUnits(r.usdValue))}</td>
                      <td className="td-actions" width="100">
                        <Button
                          id="claim"
                          className="btn btn-primary btn-sm w-full"
                          onClick={() => onClickClaim(r.sacrificeId)}
                          disabled={r.claimed || r.day.gte(currentDay)}
                        >
                          Claim<br/>$HEXIT
                        </Button>
                        <UncontrolledTooltip
                          placement="bottom"
                          target="claim"
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
            <Col md="12" className="overflow-y">
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
                  {shareInfo && shareInfo.totalUSDValue?.gt(0) ? 
                    <tr>
                      <td>${formatFloat(+utils.formatUnits(shareInfo.totalUSDValue))}</td>
                      <td>{shareInfo.shareOfPool.toString()}%</td>
                      <td>{shareInfo.startTime.toString()}</td>
                      <td>{shareInfo.endTime.toString()}</td>
                      <td>{formatFloat(+utils.formatUnits(shareInfo.hexAmount))} HEX</td>
                      <td>{formatFloat(+utils.formatUnits(shareInfo.effectiveAmount))} HEX</td>
                      <td>{formatFloat(+utils.formatUnits(shareInfo.borrowedAmount))} HEX1</td>
                      <td>${formatFloat(+utils.formatUnits(shareInfo.initUSDValue))}</td>
                      <td>${formatFloat(+utils.formatUnits(hexFeed))}</td>
                      <td className={+getHealthRatio(shareInfo.initUSDValue) >= 100 ? "green" : "red"}>
                        {getHealthRatio(shareInfo.initUSDValue)}%
                      </td>
                      <td className="td-actions" width="100">
                        <Button
                          id="claim"
                          className="btn btn-primary btn-sm w-full"
                          disabled={shareInfo.borrowedAmount.lte(0) || shareInfo.endTime.gt(shareInfo.startTime)}
                          onClick={() => onClickClaimHex1()}
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
                  display: false,
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
      <Modal
        isOpen={result}
        toggle={() => showResult(false)}
        backdrop="static"
      >
        <div className="modal-header justify-content-center">
          <button className="close" onClick={() => showResult(false)} style={{ padding: "10px", top: "10px", right: "16px" }}>
            <i className="tim-icons icon-simple-remove" />
          </button>
          <h4 className="title title-up">Claim Hexone success!</h4>
        </div>
        <div className="modal-footer" style={{ justifyContent: "flex-end" }}>
          <Button
            className="mr-2"
            color="success"
            type="button"
            size="sm"
            onClick={() => onClickAddHexitToken()}
          >
            Add Hexit
          </Button>
          <Button
            color="default"
            type="button"
            size="sm"
            onClick={() => showResult(false)}
          >
            Close
          </Button>
        </div>
      </Modal>
    </div>
  );
}
