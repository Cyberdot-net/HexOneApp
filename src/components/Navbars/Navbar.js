import React from "react";
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

export default function IndexNavbar() {
  const [collapseOpen, setCollapseOpen] = React.useState(false);
  const [collapseOut, setCollapseOut] = React.useState("");
  const [color, setColor] = React.useState("navbar-transparent");

  React.useEffect(() => {
    window.addEventListener("scroll", changeColor);
    return function cleanup() {
      window.removeEventListener("scroll", changeColor);
    };
  }, []);

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
                    width="50"
                    height="50"
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
                className="nav-link d-none d-lg-block"
                style={{width: 100}}
                color="primary"
                target="_blank"
                href="https://hex-one.gitbook.io/hex-one-protocol"
              >
                {/* <i className="tim-icons icon-spaceship" /> */} LEARN
              </Button>
            </NavItem>
            <NavItem>
              <Button
                className="nav-link d-none d-lg-block"
                style={{width: 100}}
                color="primary"
                target="_blank"
                href="https://airdrop.hex1.club"
              >
                AIRDROP
              </Button>
            </NavItem>
            <NavItem>
              <Button
                className="nav-link d-none d-lg-block"
                style={{width: 100}}
                color="primary"
                target="_blank"
                href="https://sacrifice.hex1.club"
              >
                SACRIFICE
              </Button>
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
