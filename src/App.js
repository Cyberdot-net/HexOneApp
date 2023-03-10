import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// providers
import LoadingProvider from "providers/LoadingProvider";
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
import Message from "components/Common/Message";
import Loading from "components/Common/Loading";

export default function App() {

  return (
    <WalletProvider>
      <LoadingProvider>
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
            <Loading />
          </ConnectWalletProvider>
        </MessageProvider>
      </LoadingProvider>
    </WalletProvider>
  );
}
