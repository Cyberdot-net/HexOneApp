import React, { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// providers
import LoadingProvider from "providers/LoadingProvider";
import WalletProvider from "providers/WalletProvider";
import TimerProvider from "providers/TimerProvider";

// layout components
import Layout from "components/Layout/Layout";

// modal
import Loading180Ring from "components/Common/Loading180Ring";

// views
const Overview = lazy(() => import('views/Overview'));
const Bootstrap = lazy(() => import('views/Bootstrap'));
const Staking = lazy(() => import('views/Staking'));
const Airdrop = lazy(() => import('views/Airdrop'));

export default function App() {

  return (
    <WalletProvider>
      <LoadingProvider>
        <TimerProvider>
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
                <Route exact path="/airdrop" render={(props) => <Airdrop {...props} />} />
                {/* add routes here */}
                <Redirect to='/' />
              </Switch>
            </Layout>
          </Suspense>
        </TimerProvider>
      </LoadingProvider>
    </WalletProvider>
  );
}
