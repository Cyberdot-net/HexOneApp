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
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneStaking } from "contracts";
import { TOKENS } from "contracts/Constants";
import { formatterFloat, isEmpty } from "common/utilities";

export default function Staking() {

  const { address } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ data, setData ] = useState([]);

  useEffect(() => {

    // setData([
    //   { token: "HEX1", amount: 10000, share: 0.1, apr_hex: 0, apr_hexit: 10, earned_hex: 0, earned_hexit: 52899, days: 80, liquidity: 10000000.00, multiplier: 1, open: false },
    //   { token: "HEXIT", amount: 680000, share: 2, apr_hex: 0, apr_hexit: 14, earned_hex: 0, earned_hexit: 58000, days: 10, liquidity: 4000000.00, multiplier: 1, open: false },
    //   { token: "HEX1/HEXIT", amount: 1239, share: 1.5, apr_hex: 2, apr_hexit: 30, earned_hex: 1000, earned_hexit: 50000, days: 92, liquidity: 3000000.00, multiplier: 2, open: false },
    //   { token: "HEX1/HEX", amount: 590, share: 0.08, apr_hex: 1, apr_hexit: 20, earned_hex: 5000, earned_hexit: 100000, days: 61, liquidity: 6000000.00, multiplier: 2, open: false },
    //   { token: "HEX1/USDC", amount: 1000, share: 0.006, apr_hex: 3, apr_hexit: 10, earned_hex: 3000, earned_hexit: 20000, days: 4, liquidity: 40000000.00, multiplier: 3, open: false },
    // ]);

    const getData = async () => {
      showLoading();

      const stakeList = await HexOneStaking.getStakingList();
      setData(stakeList.map(r => {
        return { ...r, stakingAmt: { value: "", bignum: BigNumber.from(0) }, open: false }
      }));
      
      hideLoading();
    }

    getData();
    
    // eslint-disable-next-line
  }, []);

  const getStakeList = async () => {
    const stakeList = await HexOneStaking.getStakingList();

    setData(prevData => {
      return stakeList.map(r => {
        const open = prevData.find(row => row.token === r.token)?.open || false;
        return { ...r, stakingAmt: { value: "", bignum: BigNumber.from(0) }, open }
      })
    });
    
  }

  const onClickShow = (token) => {
    setData(prevData => {
      return prevData.map(r => {
        if (r.token === token) r.open = !r.open;
        return r;
      })
    });
  }

  const changeStakingAmt = (e) => (token) => {
    setData(prevData => {
      return prevData.map(r => {
        if (r.token === token) {
          r.stakingAmt = { value: e.target.value, bignum: utils.parseEther(e.target.value || "0") }
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

    const amount = row.stakedAmount['bignum'].div(utils.parseUnits("1", 18 - decimals));

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

    const amount = row.stakedAmount['bignum'].div(utils.parseUnits("1", 18 - decimals));

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
            src={require("assets/img/path3.png")}
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
                      <th>Token</th>
                      <th>Amount</th>
                      <th>Share of Pool</th>
                      <th>APR</th>
                      <th>Earned</th>
                      <th>Joined</th>
                      <th>Liquidity</th>
                      <th>Multiplier</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                  {data.length > 0 ? data.map((r) => (
                    <React.Fragment key={r.token}>
                      <tr>
                        <td>{TOKENS.find(t => t.token === r.token)?.name}</td>
                        <td>{formatterFloat(+utils.formatUnits(r.stakedAmount))} HEX</td>
                        <td>{formatterFloat(r.shareOfPool)}%</td>
                        <td>{`${r.claimableHexAmount}%`} $HEX<br/>{formatterFloat(r.claimableHexitAmount)}% $HEXIT</td>
                        <td>
                            {formatterFloat(+utils.formatUnits(r.earnedHexAmount))} $HEX
                            <br/>
                            {formatterFloat(+utils.formatUnits(r.earnedHexitAmount))} $HEXIT
                        </td>
                        <td>{r.stakedTime.toString()} {+r.stakedTime > 1 ? "days" : "day"}</td>
                        <td>$ {formatterFloat(r.liquidity)}</td>
                        <td>
                            {r.hexMultiplier.gt(0) && `${r.hexMultiplier.toString()}x`}
                            {r.hexMultiplier.gt(0) && <br />}
                            {r.hexitMultiplier.gt(0) && `${r.hexitMultiplier.toString()}x`}
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
                                        onChange={changeStakingAmt(r.token)} 
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
      </div>
    </>
  );
}
