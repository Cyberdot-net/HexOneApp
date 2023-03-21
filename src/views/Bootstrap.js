import React, { useState, useEffect, useContext } from "react";
import {
  Button,
  Container,
  Row,
  Col,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import { Pie } from "react-chartjs-2";
import { BigNumber, utils } from "ethers";
import Pagination from "components/Common/Pagination";
import SacrificeModal from "components/Modals/Sacrifice";
import { WalletContext, LoadingContext } from "providers/Contexts";
import { HexOneVault, HexContract, HexOneProtocol, HexOnePriceFeed } from "contracts";
import { ITEMS_PER_PAGE, getBasePoints } from "contracts/Constants";
import { isEmpty, formatterFloat } from "common/utilities";

export default function Bootstrap() {
  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const [ hexFeed, setHexFeed ] = useState(BigNumber.from(0));
  const [ currentDay, setCurrentDay ] = useState(0);
  const [ isOpen, setOpen ] = useState(false);
  const [ overviews, setOverview ] = useState([]);
  const [ collaterals, setCollateral ] = useState([]);
  const [ chartData, setChartData ] = useState({});
  const [ page, setPage ] = useState(1);
  
  useEffect(() => {
    if (!address) return;

    setOverview([
      { shareId: 4, day: 1, erc20: "ETH", bonus: 2, totalPoints: 11111110, sacrificedAmt: 2, usdValue: 3600 },
      { shareId: 10, day: 3, erc20: "HEX", bonus: 5, totalPoints: 	28119488, sacrificedAmt: 50000, usdValue: 2500 },
    ]);

    setCollateral([
      { totalUSDValue: 4575, poolShare: 0.1, start: 549, end: 5543, collateralAmount: 46750000, effectiveAmount: 100000, borrowedAmount: 4575, initialHexPrice: utils.parseEther("0.2")  },
    ]);

    setChartData({
      labels: ['HEX', 'USDC', 'ETH', 'DAI', 'UNI'],
      datasets: [
        {
          label: 'Total amount sacrificed for each ERC20',
          data: [12, 19, 3, 5, 2],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    });
    
    HexContract.setProvider(provider);
    HexOnePriceFeed.setProvider(provider);
    HexOneVault.setProvider(provider);
    HexOneProtocol.setProvider(provider);

    const getData = async () => {
      showLoading();

      const decimals = await HexContract.getDecimals();
      setHexFeed(await HexOnePriceFeed.getHexTokenPrice(utils.parseUnits("1", decimals)));
      setCurrentDay(await HexContract.getCurrentDay());
      
      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  const getHealthRatio = (initialFeed) => {
    if (isEmpty(initialFeed)) return 0;

    const currentPrice = +utils.formatUnits(hexFeed);
    const originalPrice = +utils.formatUnits(initialFeed);
    
    return formatterFloat(Math.round((currentPrice / originalPrice) * 100));
  }

  const doSacrifice = () => {

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
              <Alert
                className="alert-with-icon"
                color="danger"
              >
                <span data-notify="icon" className="tim-icons icon-alert-circle-exc" />
                <span><b>No MetaMask! - </b>Please, connect MetaMask</span>
              </Alert>
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
              <h2>OVERVIEW</h2>
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
                  {overviews.length > 0 ? 
                    overviews.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{r.shareId}</td>
                      <td>{r.day}</td>
                      <td>{formatterFloat(getBasePoints(r.day))}</td>
                      <td>{r.erc20}</td>
                      <td>{r.bonus}x</td>
                      <td>{formatterFloat(r.totalPoints)}</td>
                      <td>{formatterFloat(r.sacrificedAmt)}</td>
                      <td>${formatterFloat(r.usdValue)}</td>
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
                  {collaterals.length > 0 ? 
                    collaterals.map((r, idx) => (
                    <tr key={idx}>
                      <td>${formatterFloat(r.totalUSDValue)}</td>
                      <td>{r.poolShare}%</td>
                      <td>{formatterFloat(r.start)}</td>
                      <td>{formatterFloat(r.end)}</td>
                      <td>{formatterFloat(r.collateralAmount)} HEX</td>
                      <td>{formatterFloat(r.effectiveAmount)} HEX</td>
                      <td>{formatterFloat(r.borrowedAmount)} HEX1</td>
                      <td>${formatterFloat(+utils.formatUnits(r.initialHexPrice))}</td>
                      <td>${formatterFloat(+utils.formatUnits(hexFeed))}</td>
                      <td className={0 >= 100 ? "green" : "red"}>
                        {getHealthRatio(r.initialHexPrice)}%
                      </td>
                      <td className="td-actions" width="100">
                        <Button
                          id="claim"
                          className="btn btn-primary btn-sm w-full"
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
              <Pie data={chartData} />
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
