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
import { utils, BigNumber } from "ethers";
import MetaMaskAlert from "components/Common/MetaMaskAlert";
import Pagination from "components/Common/Pagination";
import ClaimHexitModal from "components/Modals/ClaimHexit";
import { WalletContext, LoadingContext, TimerContext } from "providers/Contexts";
import { HexOneBootstrap, ERC20Contract } from "contracts";
import { Hexit_Addr, HexOneToken_Addr } from "contracts/address";
import { ITEMS_PER_PAGE } from "contracts/Constants";
import { formatFloat } from "common/utilities";
import { formatDecimal } from "common/utilities";
import { HexMockToken_Addr, HexOneStaking_Addr } from "contracts/address";

export default function Stats() {
    const { address, provider } = useContext(WalletContext);
    const { showLoading, hideLoading } = useContext(LoadingContext);
    const { timer } = useContext(TimerContext);
    const [currentDay, setCurrentDay] = useState(0);
    const [airdropList, setAirdropList] = useState([]);
    const [page, setPage] = useState(1);
    const [isOpen, setOpen] = useState(false);
    const [airdropStart, setAirdropStart] = useState('')
    const [airdropEnd, setAirdropEnd] = useState('')
    const isMobile = useMediaQuery({ query: `(max-width: 760px)` });
    const [totalUSD, setTotalUSD] = useState(0)
    const [hexitSupply, setHexitSupply] = useState(0)
    const [hex1Supply, setHex1Supply] = useState(0)
    const [sacHex, setSacHex] = useState(0)
    const [sacWpls, setSacWpls] = useState(0)
    const [sacPlsx, setSacPlsx] = useState(0)
    const [sacDai, setSacDai] = useState(0)
    const [hexitNotDistributed, setHexitNotDistributed] = useState(0)
    const [hexNotDistributed, setHexNotDistributed] = useState(0)


    // useEffect(() => {
    //     if (!timer || !HexOneBootstrap.connected()) return;

    //     const getData = async () => {
    //         const day = await HexOneBootstrap.getCurrentAirdropDay();
    //         setCurrentDay(day);
    //         setAirdropList([await HexOneBootstrap.getAirdropList(address)]);
    //     }

    //     getData();

    //     // eslint-disable-next-line
    // }, [timer]);


    useEffect(() => {
        if (!address || !provider) return;

        HexOneBootstrap.setProvider(provider);

        const getData = async () => {
            showLoading();

            const sacrificeData = await HexOneBootstrap.getSacrificeList(address);
            let sumUSD = BigNumber.from(0), sumHex = BigNumber.from(0), sumWpls = BigNumber.from(0), sumPlsx = BigNumber.from(0), sumDai = BigNumber.from(0);
            for (let i = 0; i < sacrificeData.length; i++) {
                switch (sacrificeData[i].sacrificeTokenSymbol) {
                    case 'HEX':
                        sumHex = sumHex.add(sacrificeData[i].sacrificedAmount)
                        break;
                    case 'DAI':
                        sumDai = sumDai.add(sacrificeData[i].sacrificedAmount)
                        break;
                    case 'WPLS':
                        sumWpls = sumWpls.add(sacrificeData[i].sacrificedAmount)
                        break;
                    case 'PLSX':
                        sumPlsx = sumPlsx.add(sacrificeData[i].sacrificedAmount)
                        break;
                }
                const tmp = sacrificeData[i].usdValue
                console.log(tmp)
                sumUSD = sumUSD.add(tmp)
            }
            console.log(sumUSD)
            setTotalUSD(formatFloat(utils.formatUnits(sumUSD, 18), 6))
            setSacHex(formatDecimal(sumHex, 8))
            setSacDai(formatDecimal(sumDai, 18))
            setSacWpls(formatDecimal(sumWpls, 18))
            setSacPlsx(formatDecimal(sumPlsx, 18))
            console.log(sacrificeData)
            {
                ERC20Contract.setProvider(provider, Hexit_Addr.contract);
                await ERC20Contract.getDecimals()
                const res = await ERC20Contract.totalSupply()
                const balance = await ERC20Contract.getBalance(HexOneStaking_Addr.contract)
                setHexitSupply(formatFloat(+utils.formatUnits(res), 3))
                setHexitNotDistributed(formatFloat(+utils.formatUnits(balance), 3))
            }

            {
                ERC20Contract.setProvider(provider, HexOneToken_Addr.contract);
                await ERC20Contract.getDecimals()
                const res = await ERC20Contract.totalSupply()
                setHex1Supply(formatFloat(+utils.formatUnits(res), 3))
            }

            {
                ERC20Contract.setProvider(provider, HexMockToken_Addr.contract);
                await ERC20Contract.getDecimals()
                const res = await ERC20Contract.getBalance(HexOneStaking_Addr.contract)
                setHexNotDistributed(formatFloat(+utils.formatUnits(res), 3))
            }

            {
                ERC20Contract.setProvider(provider, '0xefD766cCb38EaF1dfd701853BFCe31359239F305');
                const res = await ERC20Contract.getBalance('0x9b366950446E94A6D8D2ae81B2bb751dC91495E9')
                console.log(res)
            }

            // const day = await HexOneBootstrap.getCurrentAirdropDay();
            // setCurrentDay(day);
            // setAirdropList([await HexOneBootstrap.getAirdropList(address)]);

            // const st = new Date(BigNumber.from(await HexOneBootstrap.airdropStartTime()).toNumber() * 1000)
            // const en = new Date(BigNumber.from(await HexOneBootstrap.airdropEndTime()).toNumber() * 1000)

            // setAirdropStart(st.getUTCFullYear() + '-' + ("0" + (st.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + st.getUTCDate()).slice(-2) + ' ' + ("0" + st.getUTCHours()).slice(-2) + ':' + ("0" + st.getUTCMinutes()).slice(-2) + ' UTC +0')
            // setAirdropEnd(en.getUTCFullYear() + '-' + ("0" + (en.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + en.getUTCDate()).slice(-2) + ' ' + ("0" + en.getUTCHours()).slice(-2) + ':' + ("0" + en.getUTCMinutes()).slice(-2) + ' UTC +0')
            hideLoading();
        }

        getData();

        // eslint-disable-next-line
    }, [address, provider]);


    return (
        <div className="wrapper">
            <section className="section section-lg section-titles">
                <img
                    alt="..."
                    className="path"
                    src={require("assets/img/path1.png")}
                />
                <div style={{ color: 'white', fontSize: '16px', paddingTop: '50px' }}>
                    <div>Hex1 Contract Address: {HexOneToken_Addr.contract}</div>
                    <div>Hexit Contract Address: {Hexit_Addr.contract}</div>
                    <br />
                    <div>Total Sacrifice USD: {totalUSD}</div>
                    <div>Total Sacrifice HEX: {sacHex}</div>
                    <div>Total Sacrifice WPLS: {sacWpls}</div>
                    <div>Total Sacrifice PLSX: {sacPlsx}</div>
                    <div>Total Sacrifice DAI from eth: {sacDai}</div>
                    <br />
                    <div>Total Hexit Supply: {hexitSupply}</div>
                    <div>Total Hex1 Supply: {hex1Supply}</div>
                    <br />
                    <div>Total Hex in vault: { }</div>
                    <div>Total Hexit for staking(Not distributed): {hexitNotDistributed}</div>
                    <div>Total Hexit for staking(Distributed): { }</div>
                    <div>Total Hex for staking(Not distributed): {hexNotDistributed}</div>
                    <div>Total Hex for staking(Distributed): { }</div>
                </div>

            </section>
        </div>
    );
}
