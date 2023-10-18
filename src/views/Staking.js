import React, { useContext, useEffect, useState } from "react";
import { useMediaQuery } from 'react-responsive';
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
import { HexOneStaking, ERC20Contract, HexOneEscrow } from "contracts";
import { HexOneStakingMaster_Addr } from "contracts/address";
// import { SHARE_RATE } from "contracts/Constants";
import { formatFloat, formatZeroDecimal, isEmpty } from "common/utilities";
import { HexOnePriceFeed } from "contracts";


const backgroundColor = {
  "HEX1": 'rgba(255, 99, 132, 0.2)',
  "HEXIT": 'rgba(54, 162, 235, 0.2)',
  "HEX1/HEX": 'rgba(75, 192, 192, 0.2)',
  "HEX1/DAI": 'rgba(153, 102, 255, 0.2)',
  "": 'rgba(255, 159, 64, 0.2)'
};

export default function Staking() {

  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { timer } = useContext(TimerContext);
  const [currentDay, setCurrentDay] = useState(0);
  const [data, setData] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [stakeEnabled, setStakeEnabled] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });


  useEffect(() => {
    if (!timer || !HexOneStaking.connected()) return;

    const getData = async () => {

      setCurrentDay(await HexOneStaking.getCurrentDay());

      await getStakeList();
    }

    getData();

    // eslint-disable-next-line
  }, [timer]);

  useEffect(() => {
    if (!address || !provider) return;

    HexOneStaking.setProvider(provider);
    HexOneEscrow.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);

    const getData = async () => {
      showLoading();

      setCurrentDay(await HexOneStaking.getCurrentDay());

      setStakeEnabled(await HexOneStaking.getStakingEnable());
      await getStakeList();
      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [address, provider]);

  const drawPieChart = async (stakeList) => {
    const labels = stakeList.filter(r => !r.totalLockedAmount.isZero()).map(r => r.tokenSymbol);
    const data = stakeList.filter(r => !r.totalLockedAmount.isZero()).map(r => formatFloat(+utils.formatUnits(r.totalLockedAmount, r.decimals)));
    const backgroundColors = labels.map(r => r in backgroundColor ? backgroundColor[r] : backgroundColor[""]);

    if (data.length > 0) {
      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Total Value Locked Tokens',
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
    try {
      const result = await HexOneStaking.getStakingList(address);
      console.log(result)
      let stakeList = result.map(r => {
        return { ...r }
      });

      for (let k in stakeList) {
        ERC20Contract.setProvider(provider, stakeList[k].token);
        stakeList[k]['tokenSymbol'] = await ERC20Contract.getSymbol();
        stakeList[k]['decimals'] = await ERC20Contract.getDecimals();
        stakeList[k]['balance'] = await ERC20Contract.getBalance(address);
      }

      setData(prevData => {
        return stakeList.map(r => {
          const prevRow = prevData.find(row => row.token === r.token) || {};
          return { ...r, stakingAmt: { value: "", bignum: BigNumber.from(0), ...prevRow.stakingAmt }, open: prevRow.open || false }
        })
      });

      drawPieChart(stakeList);
    } catch (e) {
      console.error(e);
      setData([]);
      drawPieChart([]);
    }
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

  const setMaxAmount = (row) => {
    setData(prevData => {
      return prevData.map(r => {
        if (r.token === row.token) {
          r.stakingAmt = { value: formatZeroDecimal(row.balance), bignum: row.balance }
        }
        return r;
      });
    });
  }

  const onStake = async (row) => {
    if (isEmpty(row.stakingAmt['bignum']) || row.stakingAmt['bignum'].gt(row.balance)) return;

    showLoading("Staking...");

    ERC20Contract.setProvider(provider, row.token);

    let res = null;
    const amount = row.stakingAmt['bignum'].div(utils.parseUnits("1", 18 - row.decimals));

    const allowanceAmount = await ERC20Contract.allowance(address, HexOneStakingMaster_Addr.contract);
    if (allowanceAmount.lt(amount)) {
      res = await ERC20Contract.approve(HexOneStakingMaster_Addr.contract, amount);
      if (res.status !== "success") {
        hideLoading();
        toast.error(res.error ?? `Stake failed! ${row.tokenSymbol} Approve error!`);
        return;
      }
    }

    res = await HexOneStaking.stakeToken(row.token, amount)
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Stake failed!");
      return;
    }

    changeStakingAmt(row.token, "");
    await getStakeList();

    hideLoading();

    toast.success("Stake success!");
  }

  const onUnstake = async (row) => {
    if (isEmpty(row.stakingAmt['bignum'])) return;

    ERC20Contract.setProvider(provider, row.token);

    const amount = row.stakingAmt['bignum'].div(utils.parseUnits("1", 18 - row.decimals));

    if (amount.gt(row.stakedAmount)) {
      toast.error("Unstake failed! Too many unstaking amount!");
      return;
    }

    showLoading("Unstaking...");

    const res = await HexOneStaking.unstakeToken(row.token, amount)
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Unstake failed!");
      return;
    }

    changeStakingAmt(row.token, "");
    await getStakeList();
    hideLoading();

    toast.success("Unstake success!");
  }

  const onClaim = async (row) => {
    showLoading("Claiming...");

    const claimable = await HexOneStaking.claimable(address, row.token);
    if (!claimable) {
      hideLoading();
      toast.error("Can't Claimable!");
      return;
    }

    const res = await HexOneStaking.claimRewards(row.token)
    if (res.status !== "success") {
      hideLoading();
      toast.error(res.error ?? "Claim failed!");
      return;
    }

    await getStakeList();
    hideLoading();

    toast.success("Claim success!");
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
            <h3 className="title text-left mb-2">Day: {currentDay.toString()}</h3>
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
              <Col md="12" className="overflow-y">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Token</th>
                      <th>Amount</th>
                      <th>Share {isMobile && <br />}of {isMobile && <br />}Pool</th>
                      <th>APR</th>
                      <th>Earned</th>
                      <th>Joined</th>
                      <th>Total {isMobile && <br />}Value {isMobile && <br />}Locked ERC20</th>
                      <th>Multiplier</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? data.map((r) => (
                      <React.Fragment key={r.token}>
                        <tr>
                          <td>{r.tokenSymbol}</td>
                          <td>{formatFloat(+utils.formatUnits(r.stakedAmount, r.decimals))} {r.tokenSymbol}</td>
                          <td>{formatFloat(r.shareOfPool / 10)}%</td>
                          <td>{`${formatFloat(+r.hexAPR / 1000)}%`} $HEX<br />{formatFloat(+r.hexitAPR / 1000)}% $HEXIT</td>
                          <td>
                            {formatFloat(+utils.formatUnits(r.earnedHexAmount))} $HEX
                            <br />
                            {formatFloat(+utils.formatUnits(r.earnedHexitAmount))} $HEXIT
                          </td>
                          <td>{r.stakedTime.toString()} {+r.stakedTime > 1 ? "days" : "day"}</td>
                          <td>{formatFloat(+utils.formatUnits(r.totalLockedAmount, r.decimals))} {r.tokenSymbol}</td>
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
                              <div className="content p-4">
                                <div className="stake-panel">
                                  <Row>
                                    <Col lg="8" md="6" className={"input-panel " + (r.stakingAmt['bignum'].gt(r.balance) && " has-danger")}>
                                      <InputGroup>
                                        <Input
                                          type="text"
                                          placeholder={`Stake Amount in ${r.tokenSymbol} (${formatZeroDecimal(r.balance)} ${r.tokenSymbol} available)`}
                                          value={r.stakingAmt.value}
                                          onChange={e => changeStakingAmt(r.token, e.target.value)}
                                        />
                                        <InputGroupAddon addonType="append" className="cursor-pointer" onClick={() => setMaxAmount(r)}>
                                          <InputGroupText>MAX</InputGroupText>
                                        </InputGroupAddon>
                                      </InputGroup>
                                    </Col>
                                    <Col lg="4" md="6">
                                      <Row>
                                        <Button
                                          className="btn-simple w-full"
                                          color="info"
                                          type="button"
                                          disabled={r.stakingAmt.bignum.isZero() || !stakeEnabled}
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
                                          disabled={r.stakedAmount.isZero()}
                                        >
                                          Unstake
                                        </Button>
                                      </Row>
                                    </Col>
                                  </Row>
                                </div>
                                <div className="claim-panel">
                                  <Row className="align-center">
                                    <Col md="6" className="mb-sm-2">
                                      <strong>Claimable Amount</strong>
                                    </Col>
                                    <Col md="6">
                                      <p>
                                        {`${formatZeroDecimal(r.claimableHexAmount, 8)} HEX`}
                                      </p>
                                      <p>
                                        {`${formatZeroDecimal(r.claimableHexitAmount)} HEXIT`}
                                      </p>
                                    </Col>
                                  </Row>
                                  <Row>
                                    <Button
                                      color="info"
                                      type="button"
                                      onClick={() => onClaim(r)}
                                      disabled={r.stakedAmount.isZero()}
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
                    plugins={[ChartDataLabels, ChartDataOutLabels]}
                    legend={{
                      labels: {
                        padding: 20,
                      },
                    }}
                    options={{
                      layout: { padding: 50 },
                      legend: { display: false },
                      plugins: {
                        datalabels: {
                          color: "rgba(255, 255, 255, 0.8)",
                          textAlign: 'center',
                          opacity: 0.8,
                          formatter: function (value, context) {
                            const sum = chartData.datasets[0]?.data?.reduce((s, o) => s + o, 0);
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
