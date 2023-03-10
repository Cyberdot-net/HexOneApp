import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  Button,
  Collapse,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  NavbarBrand,
  Navbar,
  NavItem,
  Nav,
  Container,
  Row,
  Col,
  UncontrolledTooltip,
} from "reactstrap";
import { ethers } from "ethers";
import { WalletContext, ConnectWalletContext } from "providers/Contexts";
import { getShortAddress } from "common/utilities";
import { networks } from "contracts/Constants";

export default function IndexNavbar() {
  
  const history = useHistory();
  const { setProvider, setAddress, address } = useContext(WalletContext);
  const { showModal } = useContext(ConnectWalletContext);
  const [ collapseOpen, setCollapseOpen ] = useState(false);
  const [ collapseOut, setCollapseOut ] = useState("");
  const [ color, setColor ] = useState("navbar-transparent");

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum === undefined) return;

    const handleAccountsChanged = (accounts) => {
      setAddress(accounts[0]);
    };

    const handleNetworkChanged = (network) => {
      if (!networks.find(r => r.chainId === network.chainId)) {
        setProvider(null);
      }
    };
  
    const handleWalletDisconnect = (err) => {
      if (err) console.error(err);
      setProvider(null);
    };

    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('networkChanged', handleNetworkChanged)
    ethereum.on('disconnect', handleWalletDisconnect)

    window.addEventListener("scroll", changeColor);
    
    const connectMetaMask = async () => {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
      } catch (error) {
        console.error(error);
        return;
      }
      
      // Set up the provider and wallet
      const connectProvider = new ethers.providers.Web3Provider(window.ethereum);

      const network = await connectProvider.getNetwork();

      if (!networks.find(r => r.chainId === network.chainId)) {
        return;
      }

      setProvider(connectProvider);
    }
    
    // connect MetaMask Wallet
    connectMetaMask();

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('disconnect', handleWalletDisconnect);
      window.removeEventListener("scroll", changeColor);
    };
    
    // eslint-disable-next-line
  }, []);

  const gotoPage = (url) => {
    history.push(url);
  }

  const changeColor = () => {
    if (
      document.documentElement.scrollTop > 99 ||
      document.body.scrollTop > 99
    ) {
      setColor("bg-info");
    } else if (
      document.documentElement.scrollTop < 100 ||
      document.body.scrollTop < 100
    ) {
      setColor("navbar-transparent");
    }
  };
  
  const toggleCollapse = () => {
    document.documentElement.classList.toggle("nav-open");
    setCollapseOpen(!collapseOpen);
  };

  const onCollapseExiting = () => {
    setCollapseOut("collapsing-out");
  };

  const onCollapseExited = () => {
    setCollapseOut("");
  };

  return (
    <Navbar className={"fixed-top " + color} color-on-scroll="100" expand="lg">
      <Container>
        <div className="navbar-translate">
          <NavbarBrand to="/" tag={Link} id="navbar-brand">
            <img
              alt="logo"
              src={require("assets/img/logo.png")}
              width="auto"
              height="55"
            />
            {/* <span className="ml-2">HEX ONE</span> */}
          </NavbarBrand>
          <UncontrolledTooltip placement="bottom" target="navbar-brand">
            A yield-bearing stablecoin backed by T-SHARES
          </UncontrolledTooltip>
          <button
            aria-expanded={collapseOpen}
            className="navbar-toggler navbar-toggler"
            onClick={toggleCollapse}
          >
            <span className="navbar-toggler-bar bar1" />
            <span className="navbar-toggler-bar bar2" />
            <span className="navbar-toggler-bar bar3" />
          </button>
        </div>
        <Collapse
          className={"justify-content-end " + collapseOut}
          navbar
          isOpen={collapseOpen}
          onExiting={onCollapseExiting}
          onExited={onCollapseExited}
        >
          <div className="navbar-collapse-header">
            <Row>
              <Col className="collapse-brand" xs="6">
                <a href="#pablo" onClick={(e) => e.preventDefault()}>
                  <img
                    alt="logo"
                    src={require("assets/img/logo.png")}
                    width="80"
                    height="auto"
                    className="mr-3"
                  />
                  <span className="ml-2">HEX ONE</span>
                </a>
              </Col>
              <Col className="collapse-close text-right" xs="6">
                <button
                  aria-expanded={collapseOpen}
                  className="navbar-toggler"
                  onClick={toggleCollapse}
                >
                  <i className="tim-icons icon-simple-remove" />
                </button>
              </Col>
            </Row>
          </div>
          <Nav navbar>
            <NavItem>
              <Button
                className="nav-link d-lg-block"
                style={{width: 120}}
                color="primary"
                target="_blank"
                href="https://hex-one.gitbook.io/hex-one-protocol"
              >
                LEARN
              </Button>
            </NavItem>
            <NavItem>
              <Button
                className="nav-link d-lg-block"
                style={{width: 120}}
                color="primary"
                onClick={() => gotoPage("/bootstrap")}
              >
                Bootstrap
              </Button>
            </NavItem>
            <NavItem>
              <Button
                className="nav-link d-lg-block"
                style={{width: 120}}
                color="primary"
                onClick={() => gotoPage("/airdrop")}
              >
                Airdrop
              </Button>
            </NavItem>
            <NavItem>
              <Button
                className="nav-link d-lg-block"
                style={{width: 120}}
                color="primary"
                onClick={() => gotoPage("/staking")}
              >
                Staking
              </Button>
            </NavItem>
            <NavItem {...address && {className: "wallet"}}>
              {address ? <>
                <img
                  alt="metamask"
                  src={require("assets/img/metamask.png")}
                  width="auto"
                  height="20"
                  className="cursor-pointer"
                  id="metamask_connected"
                />
                <span className="ml-2">{getShortAddress(address)}</span>
                <UncontrolledTooltip placement="bottom" target="metamask_connected">
                  { address }
                </UncontrolledTooltip>
              </> : <Button
                className="nav-link d-lg-block"
                style={{width: 120}}
                onClick={() => showModal(true)}
              >
                Connect
                <i className="tim-icons icon-coins ml-1" />
              </Button>}
            </NavItem>
            <UncontrolledDropdown nav>
              <DropdownToggle
                caret
                color="default"
                data-toggle="dropdown"
                href="#pablo"
                nav
                onClick={(e) => e.preventDefault()}
              >
                <i className="fa fa-cogs d-lg-none d-xl-none" />
                Menu
              </DropdownToggle>
              <DropdownMenu className="dropdown-with-icons">
                <DropdownItem tag={Link} to="#">
                  Hex One Protocol
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Hex One Vault
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Hex One Staking
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Hex One Sacrifice
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Hex One Airdrop
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Hex One Price-feed
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Hex One Token ($HEX1)
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Hex One Incentive Token ($HEXIT)
                </DropdownItem>
                <DropdownItem tag={Link} to="#">
                  Stats
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
}
