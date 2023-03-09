import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// providers
import WalletProvider from "providers/WalletProvider";
import MessageProvider from "providers/MessageProvider";
import ConnectWalletProvider from "providers/ConnectWalletProvider";

// layout components
import Navbar from "components/Navbars/Navbar";
import Footer from "components/Footer/Footer";

// views
import Overview from "views/Overview";
import Bootstrap from "views/Bootstrap";
import Staking from "views/Staking";

// modal
import ConnectWallet from "components/Modals/ConnectWallet";
import Message from "components/Modals/Message";

export default function App() {

  return (
    <WalletProvider>
      <MessageProvider>
        <ConnectWalletProvider>
          <Navbar />
          <Switch>
            <Route exact path="/" render={(props) => <Overview {...props} />} />
            <Route exact path="/bootstrap" render={(props) => <Bootstrap {...props} />} />
            <Route exact path="/staking" render={(props) => <Staking {...props} />} />
            {/* add routes here */}
            <Redirect to='/' />
          </Switch>
          <Footer />
          <ConnectWallet />
          <Message />
        </ConnectWalletProvider>
      </MessageProvider>
    </WalletProvider>
  );
}
