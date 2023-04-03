import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Container,
  Row,
  Col,
  Alert,
  Button,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText
} from "reactstrap";
import { BigNumber, utils } from "ethers";
import { Pie } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import ChartDataOutLabels from 'chartjs-plugin-piechart-outlabels';
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import { WalletContext, LoadingContext, TimerContext } from "providers/Contexts";
import { HexOneStaking } from "contracts";
import { TOKENS } from "contracts/Constants";
import { formatFloat, isEmpty } from "common/utilities";


const backgroundColor = {
  "HEX1": 'rgba(255, 99, 132, 0.2)',
  "HEXIT": 'rgba(54, 162, 235, 0.2)',
  "HEX1/HEXIT": 'rgba(255, 206, 86, 0.2)',
  "HEX1/HEX": 'rgba(75, 192, 192, 0.2)',
  "HEX1/USDC": 'rgba(153, 102, 255, 0.2)',
  "": 'rgba(255, 159, 64, 0.2)'
};

export default function Staking() {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { timer } = useContext(TimerContext);
  const [ data, setData ] = useState([]);
  const [ chartData, setChartData ] = useState(null);

  
  useEffect(() => {
    if (!timer || !HexOneStaking.connected()) return;

    const getData = async () => {
      const stakeList = await HexOneStaking.getStakingList(address);
      setData(stakeList.map(r => {
        return { ...r, stakingAmt: { value: "", bignum: BigNumber.from(0) }, open: false }
      }));
      drawPieChart(stakeList);
    }

    getData();

    // eslint-disable-next-line
  }, [ timer ]);


  useEffect(() => {
    if (!address) return;

    HexOneStaking.setProvider(provider);

    const getData = async () => {
      showLoading();

      const stakeList = await HexOneStaking.getStakingList(address);
      setData(stakeList.map(r => {
        return { ...r, stakingAmt: { value: "", bignum: BigNumber.from(0) }, open: false }
      }));
      drawPieChart(stakeList);
      
      hideLoading();
    }

    getData();
    
    // eslint-disable-next-line
  }, [ address, provider ]);

  const drawPieChart = async (stakeList) => {
    const labels = stakeList.filter(r => !r.totalLockedUSD.isZero()).map(r => TOKENS.find(t => t.token === r.token)?.name || "");
    const data = stakeList.filter(r => !r.totalLockedUSD.isZero()).map(r => +utils.formatUnits(r.totalLockedUSD));
    const backgroundColors = labels.map(r => r in backgroundColor ? backgroundColor[r] : backgroundColor[""]);

    if (data.length > 0) {
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Total Value Locked USD',
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

  const getStakeList = async () => {
    const stakeList = await HexOneStaking.getStakingList(address);

    setData(prevData => {
      return stakeList.map(r => {
        const open = prevData.find(row => row.token === r.token)?.open || false;
        return { ...r, stakingAmt: { value: "", bignum: BigNumber.from(0) }, open }
      })
    });
    drawPieChart(stakeList);
  }

  const onClickShow = (token) => {
    setData(prevData => {
      return prevData.map(r => {
        if (r.token === token) r.open = !r.open;
        return r;
      })
    });
  }

  const changeStakingAmt = (token, value) => {
    setData(prevData => {
      return prevData.map(r => {
        if (r.token === token) {
          r.stakingAmt = { value: value, bignum: utils.parseEther(value || "0") }
        }
        return r;
      });
    });
  }

  const onStake = async (row) => {    
    if (isEmpty(row.stakingAmt['bignum'])) return;

    showLoading("Staking...");
  
    //const decimals = await Erc20Contract.getDecimals();
    const decimals = 8;

    const amount = row.stakingAmt['bignum'].div(utils.parseUnits("1", 18 - decimals));

    const res = await HexOneStaking.stakeToken(row.token, amount)
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Stake failed!");
      return;
    }

    getStakeList();
    hideLoading();
  }

  const onUnstake = async (row) => {
    if (isEmpty(row.stakingAmt['bignum'])) return;

    showLoading("Unstaking...");
  
    //const decimals = await Erc20Contract.getDecimals();
    const decimals = 8;

    const amount = row.stakingAmt['bignum'].div(utils.parseUnits("1", 18 - decimals));

    const res = await HexOneStaking.unstakeToken(address, row.token, amount)
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Unstake failed!");
      return;
    }

    getStakeList();
    hideLoading();
  }

  const onClaim = async (row) => {
    showLoading("Claiming...");

    const claimable = await HexOneStaking.claimable(address, row.token);

    if (!claimable) {
      hideLoading();
      toast.error("Can't Claimable!");
      return;
    }

    const res = await HexOneStaking.claimRewards(address, row.token)
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Claim failed!");
      return;
    }

    getStakeList();
    hideLoading();
  }

  return (
    <>
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
          </Container>
        </section>
        
        <section className="section section-lg section-tables">
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
                      <th>Token</th>
                      <th>Amount</th>
                      <th>Share of Pool</th>
                      <th>APR</th>
                      <th>Earned</th>
                      <th>Joined</th>
                      <th>Total Value Locked USD</th>
                      <th>Total Value Locked ERC20</th>
                      <th>Multiplier</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                  {data.length > 0 ? data.map((r) => (
                    <React.Fragment key={r.token}>
                      <tr>
                        <td>{TOKENS.find(t => t.token === r.token)?.name}</td>
                        <td>{formatFloat(+utils.formatUnits(r.stakedAmount))} HEX</td>
                        <td>{formatFloat(r.shareOfPool)}%</td>
                        <td>{`${+r.hexAPR}%`} $HEX<br/>{+r.hexitAPR}% $HEXIT</td>
                        <td>
                            {formatFloat(+utils.formatUnits(r.earnedHexAmount))} $HEX
                            <br/>
                            {formatFloat(+utils.formatUnits(r.earnedHexitAmount))} $HEXIT
                        </td>
                        <td>{r.stakedTime.toString()} {+r.stakedTime > 1 ? "days" : "day"}</td>
                        <td>${formatFloat(+utils.formatUnits(r.totalLockedUSD))}</td>
                        <td>{formatFloat(+utils.formatUnits(r.totalLockedAmount))}</td>
                        <td>
                            {r.hexMultiplier > 0 && `${formatFloat(r.hexMultiplier / 1000)}x`}
                            {r.hexMultiplier > 0 && <br />}
                            {r.hexitMultiplier > 0 && `${formatFloat(r.hexitMultiplier / 1000)}x`}
                        </td>
                        <td className="td-actions" width="20">
                          <button
                            className={`td-toggler ${r.open ? "active" : ""}`}
                            onClick={() => onClickShow(r.token)}
                          >
                            <i className="tim-icons icon-minimal-down" />
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={9} className={`description ${r.open ? "active" : ""}`}>
                          <div className="description-wrapper">
                            <div className="content p-md-4">
                              <div className="stake-panel">
                                <Row>
                                  <Col lg="8" md="6" className="input-panel">
                                    <InputGroup>
                                      <Input
                                        type="text"
                                        placeholder="Please, input amount"
                                        value={r.stakingAmt.value}
                                        onChange={e => changeStakingAmt(r.token, e.target.value)} 
                                      />
                                      <InputGroupAddon addonType="append">
                                        <InputGroupText>$</InputGroupText>
                                      </InputGroupAddon>
                                    </InputGroup>
                                  </Col>
                                  <Col lg="4" md="6">
                                    <Row>
                                      <Button
                                        className="btn-simple w-full"
                                        color="info"
                                        type="button"
                                        onClick={() => onStake(r)}
                                      >
                                        Stake
                                      </Button>
                                    </Row>
                                    <Row>
                                      <Button
                                        className="btn-simple w-full"
                                        color="info"
                                        type="button"
                                        onClick={() => onUnstake(r)}
                                      >
                                        Unstake
                                      </Button>
                                    </Row>
                                  </Col>
                                </Row>
                              </div>
                              <div className="claim-panel">
                                <Row>Start Claim</Row>
                                <Row>
                                  <Button
                                    color="info"
                                    type="button"
                                    onClick={() => onClaim(r)}
                                  >
                                    Claim
                                  </Button>
                                </Row>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
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
      </div>
    </>
  );
}
