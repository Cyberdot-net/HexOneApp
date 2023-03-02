import React, { useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

// layout components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";

// views
import Overview from "views/Overview";

import ConnectWallet from "components/Modals/ConnectWallet.js";

export default function App() {

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Navbar onConnect={() => setIsOpen(true)} />
      <Switch>
        <Route exact path="/" render={(props) => <Overview {...props} />} />
        {/* add routes here */}
        <Redirect to='/' />
      </Switch>
      <Footer />
      <ConnectWallet 
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}
