import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  CustomInput,
} from "reactstrap";
import { WalletContext } from "providers/Contexts";
import { formatterFloat } from "common/utilities";
import CustomSwitch from "components/Common/CustomSwitch";

export default function Staking() {

  const { address } = useContext(WalletContext);
  const [ selected, setSelected ] = useState(false);
  const [ staked, setStaked ] = useState(false);
  const [ data, setData ] = useState([]);

  useEffect(() => {

    setData([
      { token: "HEX1", amount: 10000, share: 0.1, apr: 10, upapr: 0, earned: 52899, days: 80, liquidity: 10000000.00, multiplier: 1, open: false },
      { token: "HEXIT", amount: 680000, share: 2, apr: 14, upapr: 0, earned: 58000, days: 10, liquidity: 4000000.00, multiplier: 1, open: false },
      { token: "HEX1/HEXIT", amount: 1239, share: 1.5, apr: 25, upapr: 12.5, earned: 105000, days: 92, liquidity: 3000000.00, multiplier: 2, open: false },
      { token: "HEX1/HEX", amount: 590, share: 0.08, apr: 10, upapr: 5, earned: 48000, days: 61, liquidity: 6000000.00, multiplier: 2, open: false },
      { token: "HEX1/USDC", amount: 1000, share: 0.006, apr: 15, upapr: 5, earned: 3500, days: 4, liquidity: 40000000.00, multiplier: 3, open: false },
    ]);

  }, []);

  const onClickShow = (token) => {
    setData(prevData => {
      return prevData.map(r => {
        if (r.token === token) r.open = !r.open;
        return r;
      })
    });
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
              <Col md="12">
                <div className="filter-group">
                  <div className="filter-component">
                    <span>FILTER BY</span>
                  </div>
                </div>
              </Col>
              <Col md="12">
                <div className="filter-group mb-3">
                  <div className="filter-component">
                    <CustomSwitch
                      yesLabel="Live"
                      noLabel="Finished"
                      checked={selected}
                      onChange={checked => setSelected(checked)}
                    />
                  </div>
                  <div className="filter-component">
                    <CustomInput type="switch" id="switch" label="Staked only" checked={staked} onChange={e => setStaked(e.target.checked)} />
                  </div>
                </div>
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
                      <th>Days</th>
                      <th>Liquidity</th>
                      <th>Multiplier</th>
                      <th className="text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                  {data.length > 0 ? data.map((r, idx) => (
                    <React.Fragment key={idx}>
                      <tr>
                        <td>{r.token}</td>
                        <td>{formatterFloat(r.amount)}</td>
                        <td>{formatterFloat(r.share)}%</td>
                        <td>{r.upapr && `(${r.upapr}%)`} {formatterFloat(r.apr)}%</td>
                        <td>{formatterFloat(r.earned)}</td>
                        <td>{formatterFloat(r.days)}</td>
                        <td>$ {formatterFloat(r.liquidity)}</td>
                        <td>{r.multiplier}x</td>
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
                        <td colSpan={9} className={`td-description ${r.open ? "active" : ""}`}>
                          <div className="content">

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
