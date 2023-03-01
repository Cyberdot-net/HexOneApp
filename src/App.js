import React from "react";
import { Switch, Route, Redirect  } from "react-router-dom";

// layout components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";

// views
import Overview from "views/Overview";

export default function App() {

  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" render={(props) => <Overview {...props} />} />
        {/* add routes here */}
        <Redirect to='/' />
      </Switch>
      <Footer />
    </>
  );
}
