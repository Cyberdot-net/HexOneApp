import React, { useState, useEffect, useContext } from "react";
import { useMediaQuery } from 'react-responsive';
import {
  Button,
  Container,
  Row,
  Col,
  Alert,
  UncontrolledTooltip,
} from "reactstrap";
import { utils } from "ethers";
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import Pagination from "components/Common/Pagination";
import ClaimHexitModal from "components/Modals/ClaimHexit";
import { WalletContext, LoadingContext, TimerContext } from "providers/Contexts";
import { HexOneBootstrap } from "contracts";
import { ITEMS_PER_PAGE } from "contracts/Constants";
import { formatFloat } from "common/utilities";

export default function Bootstrap() {
  const { address, provider } = useContext(WalletContext);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { timer } = useContext(TimerContext);
  const [ currentDay, setCurrentDay ] = useState(0);
  const [ airdropList, setAirdropList ] = useState([]);
  const [ page, setPage ] = useState(1);
  const [ isOpen, setOpen ] = useState(false);
  const isMobile = useMediaQuery({ query: `(max-width: 760px)` });

  
  useEffect(() => {
    if (!timer || !HexOneBootstrap.connected()) return;

    const getData = async () => {
      const day = await HexOneBootstrap.getCurrentAirdropDay();
      setCurrentDay(day);
      setAirdropList([await HexOneBootstrap.getAirdropList(address)]);
    }

    getData();
    
    // eslint-disable-next-line
  }, [ timer ]);


  useEffect(() => {
    if (!address || !provider) return;
    
    HexOneBootstrap.setProvider(provider);

    const getData = async () => {
      showLoading();

      const day = await HexOneBootstrap.getCurrentAirdropDay();
      setCurrentDay(day);
      setAirdropList([await HexOneBootstrap.getAirdropList(address)]);
      
      hideLoading();
    }

    getData();

    // eslint-disable-next-line
  }, [ address, provider ]);

  
  const showClaim = () => {
    setOpen(true);
  }

  const doClaimHexit = async () => {
    setAirdropList([await HexOneBootstrap.getAirdropList(address)]);
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
                id="claim"
                onClick={showClaim}
                disabled={airdropList[0] && airdropList[0].claimed}
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
                    <th className="text-center">ClaimId</th>
                    <th>Day</th>
                    <th>Sacrificed {isMobile && <br />}Amt USD</th>
                    <th>Sacrificed {isMobile && <br />}Bonus</th>
                    <th>Hex {isMobile && <br />}Staked {isMobile && <br />}USD</th>
                    <th>Hex {isMobile && <br />}Staked {isMobile && <br />}Bonus</th>
                    <th>Total {isMobile && <br />}Power</th>
                    <th>Total {isMobile && <br />}Daily {isMobile && <br />}HEXIT</th>
                    <th>Share {isMobile && <br />}of {isMobile && <br />}Pool</th>
                    <th>Claimed {isMobile && <br />}HEXIT</th>
                  </tr>
                </thead>
                <tbody>
                  {airdropList.length > 0 && +airdropList[0].airdropId ? 
                    airdropList.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE).map((r, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{r.airdropId.toString()}</td>
                      <td>{r.requestedDay.toString()}</td>
                      <td>${formatFloat(+utils.formatUnits(r.sacrificeUSD))}</td>
                      <td>{formatFloat(+utils.formatUnits(r.sacrificeMultiplier, 2))}x</td>
                      <td>${formatFloat(+utils.formatUnits(r.hexShares, 9))}</td>
                      <td>{formatFloat(+utils.formatUnits(r.hexShareMultiplier, 2))}x</td>
                      <td>${formatFloat(+utils.formatUnits(r.totalUSD))}</td>
                      <td>${formatFloat(+utils.formatUnits(r.dailySupplyAmount))} HEXIT</td>
                      <td>{formatFloat(+utils.formatUnits(r.shareOfPool, 1))}%</td>
                      <td>{formatFloat(+utils.formatUnits(r.claimedAmount))} HEXIT</td>
                    </tr>
                  )) : <tr>
                    <td colSpan={10} className="text-center">                
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
      {isOpen && <ClaimHexitModal 
        show={isOpen}
        onClaim={doClaimHexit}
        onClose={() => setOpen(false)}
      />}
    </div>
  );
}
