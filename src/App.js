import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// providers
import LoadingProvider from "providers/LoadingProvider";
import WalletProvider from "providers/WalletProvider";
import ConnectWalletProvider from "providers/ConnectWalletProvider";

// layout components
import Layout from "components/layout/Layout";

// modal
import ConnectWallet from "components/Modals/ConnectWallet";
import Loading from "components/Common/Loading";
import Loading180Ring from "components/Common/Loading180Ring";

// views
const Overview = lazy(() => import('./views/Overview'));
const Bootstrap = lazy(() => import('./views/Bootstrap'));
const Staking = lazy(() => import('./views/Staking'));

export default function App() {

  return (
    <WalletProvider>
      <LoadingProvider>
        <ConnectWalletProvider>
          <Suspense
            fallback={
              <div
                style={{
                  width: "100vw",
                  height: "100vh",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Loading180Ring width={48} height={48} fill="white" />
              </div>
            }
          >
            <Layout>
              <Switch>
                <Route exact path="/" render={(props) => <Overview {...props} />} />
                <Route exact path="/bootstrap" render={(props) => <Bootstrap {...props} />} />
                <Route exact path="/staking" render={(props) => <Staking {...props} />} />
                {/* add routes here */}
                <Redirect to='/' />
              </Switch>
            </Layout>
          </Suspense>
          <ConnectWallet />
          <Loading />
          <Toaster
            position="top-center"
            reverseOrder={false}
            toastOptions={{
              duration: 5000,
              style: {
                position: "relative",
                top: "4rem",
                right: "1.5rem",
                margin: "5px 0",
                padding: ".7rem 1.5rem",
                color: "white",
                fontSize: "16px",
                borderRadius: "20px",
                border: "2px solid #10172a",
                boxShadow:
                  "0px 0px 0px 1.6px #1A2238, -4px -4px 8px rgba(255, 255, 255, 0.1), 4px 8px 8px rgba(1, 7, 19, 0.2)",
                background: "linear-gradient(135deg, #35405b 0%, #222c45 100%)",
              },
            }}
          />
        </ConnectWalletProvider>
      </LoadingProvider>
    </WalletProvider>
  );
}
