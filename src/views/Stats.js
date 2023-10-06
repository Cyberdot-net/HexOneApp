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


    useEffect(() => {
        if (!timer || !HexOneBootstrap.connected()) return;

        const getData = async () => {
            const day = await HexOneBootstrap.getCurrentAirdropDay();
            setCurrentDay(day);
            setAirdropList([await HexOneBootstrap.getAirdropList(address)]);
        }

        getData();

        // eslint-disable-next-line
    }, [timer]);


    useEffect(() => {
        if (!address || !provider) return;

        HexOneBootstrap.setProvider(provider);

        const getData = async () => {
            showLoading();

            const sacrificeData = await HexOneBootstrap.getSacrificeList(address);
            let sumUSD = BigNumber.from(0);
            for (let i = 0; i < sacrificeData.length; i++) {
                sumUSD += sacrificeData[i].usdValue
            }
            setTotalUSD(formatDecimal(sumUSD))
            console.log(sacrificeData)
            {
                ERC20Contract.setProvider(provider, Hexit_Addr.contract);
                const res = await ERC20Contract.totalSupply()
                console.log(res)
            }

            {
                ERC20Contract.setProvider(provider, HexOneToken_Addr.contract);
                const res = await ERC20Contract.totalSupply()
                console.log(res)
            }

            const day = await HexOneBootstrap.getCurrentAirdropDay();
            setCurrentDay(day);
            setAirdropList([await HexOneBootstrap.getAirdropList(address)]);

            const st = new Date(BigNumber.from(await HexOneBootstrap.airdropStartTime()).toNumber() * 1000)
            const en = new Date(BigNumber.from(await HexOneBootstrap.airdropEndTime()).toNumber() * 1000)

            setAirdropStart(st.getUTCFullYear() + '-' + ("0" + (st.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + st.getUTCDate()).slice(-2) + ' ' + ("0" + st.getUTCHours()).slice(-2) + ':' + ("0" + st.getUTCMinutes()).slice(-2) + ' UTC +0')
            setAirdropEnd(en.getUTCFullYear() + '-' + ("0" + (en.getUTCMonth() + 1)).slice(-2) + '-' + ("0" + en.getUTCDate()).slice(-2) + ' ' + ("0" + en.getUTCHours()).slice(-2) + ':' + ("0" + en.getUTCMinutes()).slice(-2) + ' UTC +0')
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
                    <div>Total Sacrifice HEX: { }</div>
                    <div>Total Sacrifice WPLS: { }</div>
                    <div>Total Sacrifice PLSX: { }</div>
                    <div>Total Sacrifice DAI from eth: { }</div>
                    <div>Total Sacrifice DAI from pulse: { }</div>
                    <br />
                    <div>Total Hexit Supply: {hexitSupply}</div>
                    <div>Total Hex1 Supply: {hex1Supply}</div>
                    <br />
                    <div>Total Hex in vault: { }</div>
                    <div>Total Hexit for staking(Not distributed): { }</div>
                    <div>Total Hexit for staking(Distributed): { }</div>
                    <div>Total Hex for staking(Not distributed): { }</div>
                    <div>Total Hex for staking(Distributed): { }</div>
                </div>

            </section>
        </div>
    );
}
