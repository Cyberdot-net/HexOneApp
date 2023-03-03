import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// providers
import WalletProvider from "providers/WalletProvider";
import ModalProvider from "providers/ModalProvider";

// layout components
import Navbar from "components/Navbars/Navbar";
import Footer from "components/Footer/Footer";

// views
import Overview from "views/Overview";

// modal
import ConnectWallet from "components/Modals/ConnectWallet";

export default function App() {

  return (
    <WalletProvider>
      <ModalProvider>
        <Navbar />
        <Switch>
          <Route exact path="/" render={(props) => <Overview {...props} />} />
          {/* add routes here */}
          <Redirect to='/' />
        </Switch>
        <Footer />
        <ConnectWallet />
      </ModalProvider>
    </WalletProvider>
  );
}
