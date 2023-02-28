import React from "react";
import { Switch, Route, Redirect  } from "react-router-dom";

// layout components
import Navbar from "components/Navbars/Navbar.js";
import Footer from "components/Footer/Footer.js";

// views
import Overview from "views/Overview";
import Borrow from "views/Borrow";

export default function App() {

  return (
    <>
      <Navbar />
      <Switch>
        <Route exact path="/" render={(props) => <Overview {...props} />} />
        <Route exact path="/borrow" render={(props) => <Borrow {...props} />} />
        <Redirect to='/' />
      </Switch>
      <Footer />
    </>
  );
}
